import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Modal, Row, Form, Col, message } from "antd";
import { axiosInstance } from "../helpers/axiosInstance";
import { HideLoading, ShowLoading } from "../redux/alertsSlice";

function BusForm({
  showBusForm,
  setShowBusForm,
  type = "add",
  getData,
  selectedBus,
  setSelectedBus,
}) {
  const dispatch = useDispatch();
  const [cities, setCities] = useState([]);

  const onFinish = async (values) => {
    const payload = {
      ...values,
      busNumber: Number(values.busNumber),
      capacity: Number(values.capacity),
      price: Number(values.price),
    };
    try {
      dispatch(ShowLoading());
      let response = null;
      if (type === "add") {
        response = await axiosInstance.post("/api/buses/add-bus", payload);
      } else {
        response = await axiosInstance.put(
          `/api/buses/${selectedBus.id}`,
          payload
        );
      }
      if (response.data.success) {
        message.success(response.data.message);
      } else {
        message.error(response.data.message);
      }
      getData();
      setShowBusForm(false);
      setSelectedBus(null);
      dispatch(HideLoading());
    } catch (error) {
      message.error(error.message);
      dispatch(HideLoading());
    }
  };

  useEffect(() => {
    axiosInstance.get("/api/cities/get-all-cities").then((response) => {
      setCities(response.data.data);
    });
  }, []);

  const inputClass = "input-custom w-full";
  const selectClass = "input-custom w-full";

  return (
    <Modal
      width={720}
      title={type === "add" ? "Tambah Bus Baru" : "Edit Bus"}
      visible={showBusForm}
      onCancel={() => {
        setSelectedBus(null);
        setShowBusForm(false);
      }}
      footer={null}
      destroyOnClose
    >
      <Form layout="vertical" onFinish={onFinish} initialValues={selectedBus}>
        <Row gutter={[10, 10]}>
          <Col lg={24} xs={24}>
            <Form.Item
              label="Nama Bus"
              name="name"
              rules={[{ required: true, message: "Masukkan nama bus" }]}
            >
              <input type="text" className={inputClass} placeholder="Contoh: Sinar Jaya" />
            </Form.Item>
          </Col>
          <Col lg={12} xs={24}>
            <Form.Item
              label="No. Bus"
              name="busNumber"
              rules={[{ required: true, message: "Masukkan nomor bus" }]}
            >
              <input type="number" className={inputClass} placeholder="101" />
            </Form.Item>
          </Col>
          <Col lg={12} xs={24}>
            <Form.Item
              label="Kapasitas"
              name="capacity"
              rules={[{ required: true, message: "Masukkan kapasitas" }]}
            >
              <input type="number" className={inputClass} placeholder="20" min={1} />
            </Form.Item>
          </Col>
          <Col lg={12} xs={24}>
            <Form.Item
              label="Kota Asal"
              name="from"
              rules={[{ required: true, message: "Pilih kota asal" }]}
            >
              <select className={selectClass}>
                <option value="">Pilih kota asal</option>
                {cities.map((data, index) => {
                  return (
                    <option key={index} value={data.ville}>
                      {data.ville}
                    </option>
                  );
                })}
              </select>
            </Form.Item>
          </Col>
          <Col lg={12} xs={24}>
            <Form.Item
              label="Kota Tujuan"
              name="to"
              rules={[{ required: true, message: "Pilih kota tujuan" }]}
            >
              <select className={selectClass}>
                <option value="">Pilih kota tujuan</option>
                {cities.map((data, index) => {
                  return (
                    <option key={index} value={data.ville}>
                      {data.ville}
                    </option>
                  );
                })}
              </select>
            </Form.Item>
          </Col>
          <Col lg={8} xs={24}>
            <Form.Item
              label="Tanggal Keberangkatan"
              name="journeyDate"
              rules={[{ required: true, message: "Pilih tanggal keberangkatan" }]}
            >
              <input
                min={new Date().toISOString().split("T")[0]}
                type="date"
                className={inputClass}
              />
            </Form.Item>
          </Col>
          <Col lg={8} xs={24}>
            <Form.Item
              label="Jam Berangkat"
              name="departure"
              rules={[{ required: true, message: "Masukkan jam berangkat" }]}
            >
              <input
                type="time"
                className="block border border-blue-500 w-full p-3 rounded-lg mb-4"
              />
            </Form.Item>
          </Col>
          <Col lg={8} xs={24}>
            <Form.Item
              label="Arrival"
              name="arrival"
              rules={[
                {
                  required: type === "add" ? true : true,
                  message: "Please input arrival time!",
                  validateTrigger: "onSubmit",
                },
              ]}
            >
              <input type="time" className={inputClass} />
            </Form.Item>
          </Col>
          <Col lg={12} xs={24}>
            <Form.Item
              label="Harga (Rp)"
              name="price"
              rules={[{ required: true, message: "Masukkan harga" }]}
            >
              <input
                type="number"
                className="block border border-blue-500 w-full p-3 rounded-lg mb-4"
              />
            </Form.Item>
          </Col>
          <Col lg={12} xs={24}>
            <Form.Item
              label="Status"
              name="status"
              rules={[{ required: true, message: "Pilih status" }]}
            >
              <select className={selectClass}>
                <option value="Yet to start">Belum Berangkat</option>
                <option value="Running">Berjalan</option>
                <option disabled value="Completed">Selesai</option>
              </select>
            </Form.Item>
          </Col>
        </Row>
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => {
              setSelectedBus(null);
              setShowBusForm(false);
            }}
            className="px-4 py-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50"
          >
            Batal
          </button>
          <button type="submit" className="btn-primary-custom">
            {type === "add" ? "Tambah Bus" : "Simpan Perubahan"}
          </button>
        </div>
      </Form>
    </Modal>
  );
}

export default BusForm;
