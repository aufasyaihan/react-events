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
  const {
    mutate,
    isPending: isUpdating,
    isError: isUpdateError,
    error: updateError,
  } = useMutation({
    mutationFn: updateEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      navigate("../");
    },
  });

  function handleSubmit(formData) {
    mutate({ event: formData, id });
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
        {isUpdateError && (
          <ErrorBlock
            title="Error"
            message={updateError.info?.message || "Failed to update event"}
          />
        )}
        <EventForm inputData={data} onSubmit={handleSubmit}>
          {isUpdating ? (
            <LoadingIndicator />
          ) : (
            <>
              <Link to="../" className="button-text">
                Cancel
              </Link>
              <button type="submit" className="button">
                Update
              </button>
            </>
          )}
        </EventForm>
      </>
    );
  }

  return <Modal onClose={handleClose}>{content}</Modal>;
}
