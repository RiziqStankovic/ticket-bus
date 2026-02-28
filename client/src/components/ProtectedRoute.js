import React, { useCallback, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import { SetUser } from "../redux/usersSlice";
import { useDispatch, useSelector } from "react-redux";
import { ShowLoading, HideLoading } from "../redux/alertsSlice";
import DefaultLayout from "./DefaultLayout";

function ProtectedRoute({ children }) {
  const user_id = localStorage.getItem("user_id");
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.users);
  const navigate = useNavigate();
  const validateToken = useCallback(async () => {
    try {
      dispatch(ShowLoading());

      const response = await axios.get(`/api/users/${user_id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      dispatch(HideLoading());
      if (response.data.success) {
        dispatch(SetUser(response.data.data));
      } else {
        // User not found (misal: ID lama dari MongoDB setelah migrasi ke PostgreSQL)
        localStorage.clear();
        dispatch(SetUser(null));
        message.warning("Sesi kedaluwarsa. Silakan login kembali.");
        navigate("/login");
      }
    } catch (error) {
      const isUserNotFound =
        error.response?.data?.message === "User not found" ||
        error.response?.status === 404;
      if (isUserNotFound) {
        localStorage.clear();
        dispatch(SetUser(null));
        message.warning("Sesi kedaluwarsa. Silakan login kembali.");
        navigate("/login");
      } else {
        message.error(error.response?.data?.message || error.message);
        navigate("/login");
      }
      dispatch(HideLoading());
    }
  }, [dispatch, navigate, user_id]);

  useEffect(() => {
    if (localStorage.getItem("token") && user_id) {
      validateToken();
    } else {
      navigate("/login");
    }
  }, [navigate, validateToken, user_id]);

  return <div>{user && <DefaultLayout>{children}</DefaultLayout>}</div>;
}

export default ProtectedRoute;
