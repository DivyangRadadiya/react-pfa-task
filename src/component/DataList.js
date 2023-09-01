import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  List,
  ListItem,
  ListItemText,
  CircularProgress,
} from "@material-ui/core";
import moment from "moment";

const API_URL = "https://hn.algolia.com/api/v1/search_by_date?tags=story&page=";

const DataList = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  const observerRef = useRef(null);

  useEffect(() => {
    fetchData(page);
    const interval = setInterval(() => {
      // fetchData(page + 1);
      setPage((prevPage) => prevPage + 1);
    }, 10000);
    return () => clearInterval(interval);
  }, [page]);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    };

    const observer = new IntersectionObserver(handleObserver, observerOptions);
    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, []);

  const handleObserver = (entries) => {
    const target = entries[0];
    if (target.isIntersecting) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const fetchData = async (pageNumber) => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL + pageNumber);
      const newData = response?.data?.hits?.map((item) => ({
        title: item.title,
        author: item.author,
        created_at: moment(item.created_at).format("DD MMM YYYY"),
      }));
      setData((prevData) => [...prevData, ...newData]);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  return (
    <div>
      <List>
        {data?.map((item, index) => (
          <ListItem key={index}>
            <ListItemText
              primary={item.title}
              secondary={`Author: ${item.author}, Created at: ${item.created_at}`}
            />
          </ListItem>
        ))}
      </List>
      {loading && <CircularProgress />}
      <div ref={observerRef} style={{ height: "20px" }} />
    </div>
  );
};

export default DataList;
