import React, { useEffect, useState, useCallback } from "react";
import BusForm from "../../components/BusForm";
import { HideLoading, ShowLoading } from "../../redux/alertsSlice";
import { useDispatch } from "react-redux";
import { axiosInstance } from "../../helpers/axiosInstance";
import { message, Table } from "antd";
import { Helmet } from "react-helmet";

function AdminBuses() {
  const dispatch = useDispatch();
  const [showBusForm, setShowBusForm] = useState(false);
  const [buses, setBuses] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);

  const getBuses = useCallback(async () => {
    try {
      dispatch(ShowLoading());
      const response = await axiosInstance.post("/api/buses/get-all-buses", {});
      dispatch(HideLoading());
      if (response.data.success) {
        setBuses(response.data.data);
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  }, [dispatch]);

  const deleteBus = async (id) => {
    try {
      dispatch(ShowLoading());
      const response = await axiosInstance.delete(`/api/buses/${id}`, {});

      dispatch(HideLoading());
      if (response.data.success) {
        message.success(response.data.message);
        getBuses();
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  const columns = [
    {
      title: "Nama Bus",
      dataIndex: "name",
      key: "name",
      render: (name) => <span className="font-medium text-gray-800">{name}</span>,
    },
    {
      title: "No. Bus",
      dataIndex: "busNumber",
      key: "busNumber",
      width: 90,
    },
    {
      title: "Rute",
      key: "route",
      render: (_, record) => (
        <span className="text-gray-600">
          {record.from} → {record.to}
        </span>
      ),
    },
    {
      title: "Tanggal",
      dataIndex: "journeyDate",
      key: "journeyDate",
      width: 120,
    },
    {
      title: "Harga",
      dataIndex: "price",
      key: "price",
      width: 100,
      render: (price) => (
        <span className="font-medium text-primary-600">
          Rp {Number(price).toLocaleString("id-ID")}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => {
        const s = status || "";
        if (s === "Completed") {
          return (
            <span className="inline-flex px-2 py-1 rounded-lg text-xs font-medium bg-red-100 text-red-700">
              Selesai
            </span>
          );
        }
        if (s.toLowerCase() === "running") {
          return (
            <span className="inline-flex px-2 py-1 rounded-lg text-xs font-medium bg-amber-100 text-amber-700">
              Berjalan
            </span>
          );
        }
        return (
          <span className="inline-flex px-2 py-1 rounded-lg text-xs font-medium bg-green-100 text-green-700">
            Belum Berangkat
          </span>
        );
      },
    },
    {
      title: "Aksi",
      key: "action",
      width: 100,
      render: (_, record) => (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setSelectedBus(record);
              setShowBusForm(true);
            }}
            className="p-2 rounded-lg text-primary-600 hover:bg-primary-50 transition-colors"
            title="Edit"
          >
            <i className="ri-pencil-line text-lg"></i>
          </button>
          <button
            type="button"
            onClick={() => deleteBus(record.id)}
            className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
            title="Hapus"
          >
            <i className="ri-delete-bin-line text-lg"></i>
          </button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    getBuses();
  }, [getBuses]);

  return (
    <>
      <Helmet>
        <title>Kelola Bus - Admin</title>
      </Helmet>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Kelola Bus</h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">
              Tambah, edit, atau hapus data bus
            </p>
          </div>
          <button
            type="button"
            className="btn-primary-custom flex items-center gap-2 w-fit"
            onClick={() => {
              setSelectedBus(null);
              setShowBusForm(true);
            }}
          >
            <i className="ri-add-line text-lg"></i>
            Tambah Bus
          </button>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl shadow-card border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <Table
              columns={columns}
              dataSource={buses}
              rowKey="id"
              scroll={{ x: 700 }}
              pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} bus`,
              locale: { items_per_page: " / halaman" },
            }}
              locale={{ emptyText: "Belum ada data bus. Klik Tambah Bus untuk mulai." }}
            />
          </div>
        </div>

        {showBusForm && (
          <BusForm
            showBusForm={showBusForm}
            setShowBusForm={setShowBusForm}
            type={selectedBus ? "edit" : "add"}
            selectedBus={selectedBus}
            setSelectedBus={setSelectedBus}
            getData={getBuses}
          />
        )}
      </div>
    </>
  );
}

export default AdminBuses;
