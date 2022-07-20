import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Pagination({
  location,
  searchParams,
  pageNumberParamName,
  pageNumber,
  totalPages,
}) {
  const [urlFirst, setUrlFirst] = useState(null);
  const [urlLast, setUrlLast] = useState(null);
  const [urlCurrent, setUrlCurrent] = useState(null);
  const [urlPrevious, setUrlPrevious] = useState(null);
  const [urlNext, setUrlNext] = useState(null);

  function getRoutePath(location, searchParams) {
    const { pathname } = location;
    let path = pathname;

    if (searchParams != null) {
      const searchParamsString = searchParams.toString();

      if (searchParamsString.length > 0) {
        path += "?" + searchParamsString;
      }
    }

    return path;
  }

  useEffect(() => {
    const currentUrl = getRoutePath(location, searchParams);

    setUrlFirst(getUrl(currentUrl, 1, pageNumberParamName));
    setUrlPrevious(getUrl(currentUrl, pageNumber - 1, pageNumberParamName));
    setUrlCurrent(currentUrl);
    setUrlNext(getUrl(currentUrl, pageNumber + 1, pageNumberParamName));
    setUrlLast(getUrl(currentUrl, totalPages, pageNumberParamName));
  }, [location, searchParams, pageNumberParamName, pageNumber, totalPages]);

  function getUrl(url, page, paramName) {
    if (!url.includes("/?")) {
      url = url.replace("?", "/?");
    }

    const tokens = url.split("/");

    const lastPart = tokens.pop();

    if (lastPart.includes(paramName + "=")) {
      if (lastPart.startsWith("?" + paramName)) {
        if (lastPart.includes("&")) {
          return (
            tokens.map((x) => x + "/").join("") +
            "?" +
            paramName +
            "=" +
            page +
            lastPart
              .split("&")
              .slice(1)
              .map((x) => "&" + x)
              .join("")
          );
        } else {
          return (
            tokens.map((x) => x + "/").join("") + "?" + paramName + "=" + page
          );
        }
      } else {
        return (
          tokens.map((x) => x + "/").join("") +
          lastPart
            .split("&")
            .map((x) =>
              x.startsWith("?")
                ? x
                : "&" + (x.startsWith(paramName) ? paramName + "=" + page : x)
            )
            .join("")
        );
      }
    } else if (lastPart.includes("?")) {
      return url + "&" + paramName + "=" + page;
    } else {
      return url + "?" + paramName + "=" + page;
    }
  }

  return (
    <React.Fragment>
      {totalPages > 1 && (
        <nav className="pagination" role="navigation" aria-label="pagination">
          {urlPrevious && (
            <Link
              to={urlPrevious}
              className={
                "pagination-previous " + (pageNumber <= 1 ? "is-disabled" : "")
              }
            >
              Previous
            </Link>
          )}
          {urlNext && (
            <Link
              to={urlNext}
              className={
                "pagination-next " +
                (pageNumber >= totalPages ? "is-disabled" : "")
              }
            >
              Next page
            </Link>
          )}
          <ul className="pagination-list">
            {pageNumber > 1 && urlFirst && (
              <li>
                <Link
                  to={urlFirst}
                  className="pagination-link"
                  aria-label="Goto page 1"
                >
                  1
                </Link>
              </li>
            )}
            {pageNumber > 3 && (
              <li>
                <span className="pagination-ellipsis">&hellip;</span>
              </li>
            )}
            {pageNumber > 2 && urlPrevious && (
              <li>
                <Link
                  to={urlPrevious}
                  className="pagination-link"
                  aria-label={"Goto page " + (pageNumber - 1)}
                >
                  {pageNumber - 1}
                </Link>
              </li>
            )}
            {urlCurrent && (
              <li>
                <Link
                  to={urlCurrent}
                  className="pagination-link is-current"
                  aria-label="{pageNumber}"
                  aria-current="page"
                >
                  {pageNumber}
                </Link>
              </li>
            )}
            {pageNumber < totalPages - 1 && urlNext && (
              <li>
                <Link
                  to={urlNext}
                  className="pagination-link"
                  aria-label={"Goto page " + (pageNumber + 1)}
                >
                  {pageNumber + 1}
                </Link>
              </li>
            )}
            {pageNumber < totalPages - 2 && (
              <li>
                <span className="pagination-ellipsis">&hellip;</span>
              </li>
            )}
            {pageNumber < totalPages && urlLast && (
              <li>
                <Link
                  to={urlLast}
                  className="pagination-link"
                  aria-label={"Goto page " + totalPages}
                >
                  {totalPages}
                </Link>
              </li>
            )}
          </ul>
        </nav>
      )}
    </React.Fragment>
  );
}

export default Pagination;
