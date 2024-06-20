import { Link, Outlet, useParams } from "react-router-dom";

import Header from "../Header.jsx";
import { useQuery } from "@tanstack/react-query";
import { fetchEvent } from "../../util/http.js";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";

export default function EventDetails() {
  const { id } = useParams();
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["event-details"],
    queryFn: ({ signal }) => fetchEvent({ signal, id }),
  });
  return (
    <>
      <Outlet />
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
        {isPending && <LoadingIndicator />}
        {data && (
          <>
            <header>
              <h1>{data?.title}</h1>
              <nav>
                <button>Delete</button>
                <Link to="edit">Edit</Link>
              </nav>
            </header>
            <div id="event-details-content">
              <img src={`http://localhost:3000/${data?.image}`} alt="" />
              <div id="event-details-info">
                <div>
                  <p id="event-details-location">{data?.location}</p>
                  <time dateTime={`Todo-DateT$Todo-Time`}>
                    {data?.date} @ {data?.time}
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
