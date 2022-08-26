import http from "../http";
import React, { useState, useEffect } from "react";
import PhotoThumbnail from "./PhotoThumbnail";

function PhotoThumbnailAis({ alert, mmsi, stationId }) {
  const [photoData, setPhotoData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imgTitle, setImgTitle] = useState(null);
  const [filename, setFilename] = useState(null);
  const [filenameThumbnail, setFilenameThumbnail] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchData() {
      if (mmsi != null || stationId != null) {
        try {
          setIsLoading(true);
          const result = await http.plain.get("/photo", {
            params: {
              pageNumber: 1,
              pageSize: 1,
              mmsi: mmsi,
              stationId: stationId,
            },
          });

          if (result?.data?.items?.length > 0) {
            setPhotoData(result.data.items[0]);
          } else {
            setPhotoData(null);
          }
        } catch (error) {
          alert("danger", "Unable to display photo, please try again later.");
        } finally {
          setIsLoading(false);
        }
      }
    }

    fetchData();

    return () => controller.abort();
  }, [mmsi, stationId]);

  useEffect(() => {
    if (photoData?.author != null) {
      setImgTitle("Photo by " + photoData.author);
    } else {
      setImgTitle(null);
    }

    if (photoData?.filenameThumbnail != null) {
      setFilenameThumbnail(
        process.env.REACT_APP_PHOTOS_URL + photoData.filenameThumbnail
      );
    } else if (photoData?.filename != null) {
      setFilenameThumbnail(
        process.env.REACT_APP_PHOTOS_URL + photoData.filename
      );
    } else {
      setFilenameThumbnail(null);
    }

    if (photoData?.filename != null) {
      setFilename(process.env.REACT_APP_PHOTOS_URL + photoData.filename);
    } else {
      setFilename(null);
    }
  }, [photoData]);

  return (
    <PhotoThumbnail
      isLoading={isLoading}
      filename={filename}
      filenameThumbnail={filenameThumbnail}
      width={photoData?.width}
      height={photoData?.height}
      title={imgTitle}
    />
  );
}

export default PhotoThumbnailAis;
