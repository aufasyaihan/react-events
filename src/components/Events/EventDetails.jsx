import { Link, Outlet, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";

import Header from "../Header.jsx";
import { useMutation, useQuery } from "@tanstack/react-query";
import { deleteEvent, fetchEvent, queryClient } from "../../util/http.js";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import Modal from "../UI/Modal.jsx";

export default function EventDetails() {
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["event", id],
    queryFn: ({ signal }) => fetchEvent({ signal, id }),
    staleTime: 0,
  });

  const {
    mutate,
    isPending: isDeletingPending,
    isError: isDeletingError,
    error: deletingError,
  } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["events"],
        refetchType: "none", // prevent the query from being refetched
      }); // invalidate the events query and set it to stale then the query can be refetched
      navigate("../");
    },
  });

  function handleDelete(id) {
    mutate({ id });
  }

  function handleModal() {
    setIsDeleting((prevState) => !prevState);
  }

  const formattedDate = new Date(data?.date).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  return (
    <>
      <Outlet />
      {isDeleting && (
        <Modal onClose={handleModal}>
          <article>
            <h1>Are you sure?</h1>
            <div className="form-actions">
              {isDeletingPending ? (
                <LoadingIndicator />
              ) : (
                <>
                  <button className="button-text" onClick={handleModal}>
                    No
                  </button>
                  <button className="button" onClick={() => handleDelete(id)}>
                    Yes
                  </button>
                </>
              )}
            </div>
          </article>
          {isDeletingError && (
            <ErrorBlock
              title="An error occurred"
              message={deletingError.info?.message || "Failed to delete event"}
            />
          )}
        </Modal>
      )}
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      {isError && (
        <ErrorBlock
          title="An error occurred"
          message={error.title?.message || "Failed to fetch event"}
        />
      )}
      <article id="event-details">
        {isPending && (
          <div className="center">
            <LoadingIndicator />
          </div>
        )}
        {data && (
          <>
            <header>
              <h1>{data?.title}</h1>
              <nav>
                <button onClick={handleModal}>Delete</button>
                <Link to="edit">Edit</Link>
              </nav>
            </header>
            <div id="event-details-content">
              <img
                src={`http://localhost:3000/${data?.image}`}
                alt={data?.title}
              />
              <div id="event-details-info">
                <div>
                  <p id="event-details-location">{data?.location}</p>
                  <time dateTime={`Todo-DateT$Todo-Time`}>
                    {formattedDate} @ {data?.time}
                  </time>
                </div>
                <p id="event-details-description">{data?.description}</p>
              </div>
            </div>
          </>
        )}
      </article>
    </>
  );
}
