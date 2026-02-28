import React, { useCallback, useEffect, useRef } from "react";
import { axiosInstance } from "../helpers/axiosInstance";
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
  const redirectingRef = useRef(false);

  const validateToken = useCallback(async () => {
    if (redirectingRef.current) return;
    try {
      dispatch(ShowLoading());

      const response = await axiosInstance.get(`/api/users/${user_id}`);
      dispatch(HideLoading());
      if (response.data.success) {
        dispatch(SetUser(response.data.data));
      } else {
        redirectingRef.current = true;
        localStorage.clear();
        dispatch(SetUser(null));
        message.warning("Sesi kedaluwarsa. Silakan login kembali.");
        navigate("/");
      }
    } catch (error) {
      if (redirectingRef.current) return;
      redirectingRef.current = true;

      const isUserNotFound =
        error.response?.data?.message === "User not found" ||
        error.response?.status === 404;
      if (isUserNotFound) {
        localStorage.clear();
        dispatch(SetUser(null));
        message.warning("Sesi kedaluwarsa. Silakan login kembali.");
        navigate("/");
      } else {
        localStorage.clear();
        dispatch(SetUser(null));
        message.error(error.response?.data?.message || error.message);
        navigate("/");
      }
      dispatch(HideLoading());
    }
  }, [dispatch, navigate, user_id]);

  useEffect(() => {
    if (redirectingRef.current) return;
    if (localStorage.getItem("token") && user_id) {
      validateToken();
    } else {
      if (localStorage.getItem("token")) localStorage.clear();
      navigate("/");
    }
  }, [navigate, validateToken, user_id]);

  return <div>{user && <DefaultLayout>{children}</DefaultLayout>}</div>;
}

export default ProtectedRoute;
