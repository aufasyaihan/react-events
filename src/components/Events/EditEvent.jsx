import { Link, useNavigate, useParams } from "react-router-dom";

import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";
import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchEvent, queryClient, updateEvent } from "../../util/http.js";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["events", id],
    queryFn: ({ signal }) => fetchEvent({ signal, id }),
  });
  const { mutate } = useMutation({
    mutationFn: updateEvent,
    onMutate: async (data) => {
      const newEvent = data.event;
      await queryClient.cancelQueries({ queryKey: ["events", id] }); // cancel the previous query
      const prevEvent = queryClient.getQueryData(["events", id]); // get the previous data
      queryClient.setQueryData(["events", id], newEvent); // update the query data
      return { prevEvent };
    }, // onMutate is called while the mutation is executed
    onError: (error, data, context) => {
      queryClient.setQueryData(["events", id], context.prevEvent); // rollback the query data
    },
    onSettled: () => {
      queryClient.invalidateQueries(["events"], id); // invalidate the events query and set it to stale then the query can be refetched
    },
  });

  function handleSubmit(formData) {
    mutate({ event: formData, id });
    navigate("../");
  }

  function handleClose() {
    navigate("../");
  }
  let content;

  if (isPending) {
    content = (
      <div className="center">
        <LoadingIndicator />
      </div>
    );
  }

  if (isError) {
    content = (
      <>
        <ErrorBlock
          title="An error occurred"
          message={error.info?.message || "Failed to fetch events"}
        />
        <div className="form-actions">
          <Link to="../" className="button-text">
            Back
          </Link>
        </div>
      </>
    );
  }

  if (data) {
    content = (
      <>
        <EventForm inputData={data} onSubmit={handleSubmit}>
          <Link to="../" className="button-text">
            Cancel
          </Link>
          <button type="submit" className="button">
            Update
          </button>
        </EventForm>
      </>
    );
  }

  return <Modal onClose={handleClose}>{content}</Modal>;
}
