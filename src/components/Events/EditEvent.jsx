import {
  Link,
  redirect,
  useNavigate,
  useNavigation,
  useParams,
  useSubmit,
} from "react-router-dom";

import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";
import {
  // useMutation,
  useQuery,
} from "@tanstack/react-query";
import { fetchEvent, queryClient, updateEvent } from "../../util/http.js";
import ErrorBlock from "../UI/ErrorBlock.jsx";

export default function EditEvent() {
  const { id } = useParams();
  const submit = useSubmit();
  const { state } = useNavigation();
  const navigate = useNavigate();
  const { data, isError, error } = useQuery({
    queryKey: ["events", id],
    queryFn: ({ signal }) => fetchEvent({ signal, id }),
    staleTime: 10000,
  });
  // const { mutate } = useMutation({
  //   mutationFn: updateEvent,
  //   onMutate: async (data) => {
  //     const newEvent = data.event;
  //     await queryClient.cancelQueries({ queryKey: ["events", id] }); // cancel the previous query
  //     const prevEvent = queryClient.getQueryData(["events", id]); // get the previous data
  //     queryClient.setQueryData(["events", id], newEvent); // update the query data
  //     return { prevEvent };
  //   }, // onMutate is called while the mutation is executed
  //   onError: (error, data, context) => {
  //     queryClient.setQueryData(["events", id], context.prevEvent); // rollback the query data
  //   },
  //   onSettled: () => {
  //     queryClient.invalidateQueries(["events"], id); // invalidate the events query and set it to stale then the query can be refetched
  //   },
  // });

  function handleSubmit(formData) {
    // mutate({ event: formData, id });
    // navigate("../");
    submit(formData, { method: "PUT" });
  }

  function handleClose() {
    navigate("../");
  }
  let content;

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
          {state === "submitting" ? (
            <p>Saving...</p>
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

export function loader({ params }) {
  return queryClient.fetchQuery({
    queryKey: ["events", params.id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),
  });
}

export async function action({ request, params }) {
  const formData = await request.formData();
  const updates = Object.fromEntries(formData);
  await updateEvent({ event: updates, id: params.id });
  await queryClient.invalidateQueries(["events"]);
  return redirect("../");
}
