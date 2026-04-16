import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import EllipsisText from "react-ellipsis-text";
import { useForm } from "react-hook-form";
import {
  Link,
  Navigate,
  NavLink,
  Outlet,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import * as yup from "yup";
import { productCategories } from "./data/mockData";
import { loginUser, logoutUser, observeAuthState } from "./services/authService";
import { addItem, deleteItem, fetchCollection, updateItem } from "./services/dataService";

const AuthContext = createContext(null);
const tableEmpty = <p className="table-empty">No records found.</p>;

const menuItems = [
  { to: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { to: "/orders", label: "Orders", icon: "orders" },
  { to: "/products", label: "Products", icon: "products" },
  { to: "/customers", label: "Customers", icon: "customers" },
  { to: "/suppliers", label: "Suppliers", icon: "suppliers" },
];

const formatCurrency = (value) => `${Number(value).toLocaleString("tr-TR")} TL`;

const Icon = ({ name, className = "icon", title }) => (
  <svg className={className} aria-hidden={!title} role={title ? "img" : "presentation"}>
    {title ? <title>{title}</title> : null}
    <use href={`/icons.svg#${name}`} />
  </svg>
);

const useAuth = () => useContext(AuthContext);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = observeAuthState((authUser) => {
      setUser(authUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login: loginUser,
      logout: async () => {
        await logoutUser();
        setUser(null);
      },
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <p className="page-status">Loading...</p>;
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

function PublicRoute() {
  const { user, loading } = useAuth();
  if (loading) return <p className="page-status">Loading...</p>;
  return user ? <Navigate to="/dashboard" replace /> : <Outlet />;
}

function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const onLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="header">
      <Link className="logo-link" to={user ? "/dashboard" : "/login"}>
        <Icon name="logo" className="logo-icon" title="Medicine Store logo" />
        <span>Medicine Store</span>
      </Link>

      <div className="header-title">
        <h1>Medicine Store</h1>
        <Link to="/dashboard">Dashboard</Link>
      </div>

      <div className="header-user">
        <span>{`/${user?.email ?? "vendor@gmail.com"}`}</span>
        <button type="button" onClick={onLogout} className="logout-btn">
          Logout
        </button>
      </div>
    </header>
  );
}

function Sidebar() {
  return (
    <aside className="sidebar">
      <nav aria-label="Sidebar menu">
        <ul className="menu-list">
          {menuItems.map((item) => (
            <li key={item.to}>
              <NavLink className="menu-link" to={item.to}>
                <Icon name={item.icon} />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

function SharedLayout() {
  return (
    <div className="layout">
      <Header />
      <div className="layout-main">
        <Sidebar />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

const loginSchema = yup.object({
  email: yup.string().email("Gecerli bir email girin").required("Email zorunludur"),
  password: yup.string().min(6, "Sifre en az 6 karakter olmali").required("Sifre zorunludur"),
});

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [requestError, setRequestError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { email: "", password: "" },
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (values) => {
    setRequestError("");
    try {
      await login(values);
      navigate("/home", { replace: true });
    } catch (error) {
      setRequestError(error.message);
    }
  };

  return (
    <section className="login-page">
      <form className="card login-form" onSubmit={handleSubmit(onSubmit)}>
        <h2>Log In</h2>
        <p className="form-caption">Demo: vendor@gmail.com / Admin123!</p>

        <label>
          Email
          <input type="email" placeholder="Email" autoComplete="email" {...register("email")} />
        </label>
        {errors.email ? <p className="field-error">{errors.email.message}</p> : null}

        <label>
          Sifre
          <input
            type="password"
            placeholder="Password"
            autoComplete="current-password"
            {...register("password")}
          />
        </label>
        {errors.password ? <p className="field-error">{errors.password.message}</p> : null}

        {requestError ? <p className="field-error">{requestError}</p> : null}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing..." : "Log In Now"}
        </button>
      </form>
    </section>
  );
}

function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [recentCustomers, setRecentCustomers] = useState([]);
  const [incomeExpenses, setIncomeExpenses] = useState([]);

  useEffect(() => {
    Promise.all([
      fetchCollection("statistics"),
      fetchCollection("recentCustomers"),
      fetchCollection("incomeExpenses"),
    ]).then(([statistics, recent, incomes]) => {
      setStats(statistics);
      setRecentCustomers(recent);
      setIncomeExpenses(incomes);
    });
  }, []);

  if (!stats) return <p className="page-status">Loading dashboard...</p>;

  return (
    <section className="page-grid">
      <div className="card stats">
        <h2>Statistics</h2>
        <div className="stats-grid">
          <article>
            <h3>All products</h3>
            <p>{stats.allProducts}</p>
          </article>
          <article>
            <h3>All suppliers</h3>
            <p>{stats.allSuppliers}</p>
          </article>
          <article>
            <h3>All customers</h3>
            <p>{stats.allCustomers}</p>
          </article>
        </div>
      </div>

      <div className="card">
        <h2>Recent Customers</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Spent</th>
              </tr>
            </thead>
            <tbody>
              {recentCustomers.map((item) => (
                <tr key={item.id}>
                  <td>
                    <EllipsisText text={item.name} length={18} />
                  </td>
                  <td>{item.email}</td>
                  <td>{formatCurrency(item.spent)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h2>Income / Expenses</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {incomeExpenses.map((item) => (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td>{item.email}</td>
                  <td className={item.type === "income" ? "status positive" : "status negative"}>
                    {formatCurrency(item.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function FilterBar({ placeholder, value, setValue, onFilter }) {
  return (
    <div className="filter-row">
      <input value={value} onChange={(event) => setValue(event.target.value)} placeholder={placeholder} />
      <button type="button" onClick={onFilter}>
        Filter
      </button>
    </div>
  );
}

function OrdersPage() {
  const [rows, setRows] = useState([]);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCollection("orders").then(setRows);
  }, []);

  const filtered = rows.filter((row) => row.userInfo.toLowerCase().includes(search.toLowerCase()));

  return (
    <section className="card">
      <h2>All orders</h2>
      <FilterBar placeholder="User Name" value={input} setValue={setInput} onFilter={() => setSearch(input)} />
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>User Info</th>
              <th>Address</th>
              <th>Products</th>
              <th>Order date</th>
              <th>Price</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id}>
                <td>{item.userInfo}</td>
                <td>
                  <EllipsisText text={item.address} length={21} />
                </td>
                <td>
                  <EllipsisText text={item.products} length={22} />
                </td>
                <td>{item.orderDate}</td>
                <td>{formatCurrency(item.price)}</td>
                <td>{item.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 ? tableEmpty : null}
      </div>
    </section>
  );
}

function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <article className="modal" onClick={(event) => event.stopPropagation()}>
        <header className="modal-header">
          <h3>{title}</h3>
          <button type="button" onClick={onClose} className="icon-btn">
            <Icon name="close" />
          </button>
        </header>
        {children}
      </article>
    </div>
  );
}

const productSchema = yup.object({
  productInfo: yup.string().required(),
  category: yup.string().required(),
  stock: yup.number().typeError("Stok sayi olmali").required().min(0),
  suppliers: yup.string().required(),
  price: yup.number().typeError("Fiyat sayi olmali").required().min(0),
});

function ProductModal({ open, initialValues, onClose, onSubmit }) {
  const isEdit = Boolean(initialValues?.id);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      productInfo: "",
      category: productCategories[0],
      stock: "",
      suppliers: "",
      price: "",
    },
    resolver: yupResolver(productSchema),
  });

  useEffect(() => {
    if (open) {
      reset(
        initialValues ?? {
          productInfo: "",
          category: productCategories[0],
          stock: "",
          suppliers: "",
          price: "",
        },
      );
    }
  }, [initialValues, open, reset]);

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit Product Data" : "Add New Product"}>
      <form className="modal-form" onSubmit={handleSubmit(onSubmit)}>
        <label>
          Product Info
          <input {...register("productInfo")} />
          {errors.productInfo ? <small>{errors.productInfo.message}</small> : null}
        </label>
        <label>
          Category
          <select {...register("category")}>
            {productCategories.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label>
          Stock
          <input type="number" {...register("stock")} />
          {errors.stock ? <small>{errors.stock.message}</small> : null}
        </label>
        <label>
          Suppliers
          <input {...register("suppliers")} />
          {errors.suppliers ? <small>{errors.suppliers.message}</small> : null}
        </label>
        <label>
          Price
          <input type="number" {...register("price")} />
          {errors.price ? <small>{errors.price.message}</small> : null}
        </label>
        <div className="modal-actions">
          <button type="button" onClick={onClose} className="secondary-btn">
            Cancel
          </button>
          <button type="submit">{isSubmitting ? "Saving..." : isEdit ? "Save" : "Add"}</button>
        </div>
      </form>
    </Modal>
  );
}

function ProductsPage() {
  const [rows, setRows] = useState([]);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchCollection("products").then((result) => {
      const sorted = result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRows(sorted);
    });
  }, []);

  const openAdd = () => {
    setEditing(null);
    setIsOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setIsOpen(true);
  };

  const closeModal = () => setIsOpen(false);

  const handleSave = async (values) => {
    if (editing) {
      const updated = await updateItem("products", editing.id, values);
      setRows((prev) => prev.map((item) => (item.id === editing.id ? updated : item)));
    } else {
      const created = await addItem("products", { ...values, createdAt: new Date().toISOString() });
      setRows((prev) => [created, ...prev]);
    }
    setIsOpen(false);
  };

  const handleDelete = async (id) => {
    await deleteItem("products", id);
    setRows((prev) => prev.filter((item) => item.id !== id));
  };

  const filtered = rows.filter((row) => row.productInfo.toLowerCase().includes(search.toLowerCase()));

  return (
    <section className="card">
      <h2>All products</h2>
      <FilterBar
        placeholder="Product Name"
        value={input}
        setValue={setInput}
        onFilter={() => setSearch(input)}
      />
      <button type="button" className="add-btn" onClick={openAdd}>
        + Add a new product
      </button>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Product Info</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Suppliers</th>
              <th>Price</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id}>
                <td>
                  <EllipsisText text={item.productInfo} length={23} />
                </td>
                <td>{item.category}</td>
                <td>{item.stock}</td>
                <td>
                  <EllipsisText text={item.suppliers} length={16} />
                </td>
                <td>{formatCurrency(item.price)}</td>
                <td className="actions-cell">
                  <button type="button" className="icon-btn" onClick={() => openEdit(item)} aria-label="Edit">
                    <Icon name="edit" />
                  </button>
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => handleDelete(item.id)}
                    aria-label="Delete"
                  >
                    <Icon name="delete" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 ? tableEmpty : null}
      </div>

      <ProductModal open={isOpen} initialValues={editing} onClose={closeModal} onSubmit={handleSave} />
    </section>
  );
}

const supplierSchema = yup.object({
  suppliersInfo: yup.string().required(),
  address: yup.string().required(),
  company: yup.string().required(),
  deliveryDate: yup.string().required(),
  amount: yup.number().typeError("Amount sayi olmali").required().min(1),
  status: yup.string().required(),
});

function SupplierModal({ open, initialValues, onClose, onSubmit }) {
  const isEdit = Boolean(initialValues?.id);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      suppliersInfo: "",
      address: "",
      company: "",
      deliveryDate: "",
      amount: "",
      status: "Active",
    },
    resolver: yupResolver(supplierSchema),
  });

  useEffect(() => {
    if (open) {
      reset(
        initialValues ?? {
          suppliersInfo: "",
          address: "",
          company: "",
          deliveryDate: "",
          amount: "",
          status: "Active",
        },
      );
    }
  }, [initialValues, open, reset]);

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit Supplier Data" : "Add New Supplier"}>
      <form className="modal-form" onSubmit={handleSubmit(onSubmit)}>
        <label>
          Suppliers Info
          <input {...register("suppliersInfo")} />
          {errors.suppliersInfo ? <small>{errors.suppliersInfo.message}</small> : null}
        </label>
        <label>
          Address
          <input {...register("address")} />
          {errors.address ? <small>{errors.address.message}</small> : null}
        </label>
        <label>
          Company
          <input {...register("company")} />
          {errors.company ? <small>{errors.company.message}</small> : null}
        </label>
        <label>
          Delivery date
          <input type="date" {...register("deliveryDate")} />
          {errors.deliveryDate ? <small>{errors.deliveryDate.message}</small> : null}
        </label>
        <label>
          Amount
          <input type="number" {...register("amount")} />
          {errors.amount ? <small>{errors.amount.message}</small> : null}
        </label>
        <label>
          Status
          <select {...register("status")}>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Disabled">Disabled</option>
          </select>
        </label>
        <div className="modal-actions">
          <button type="button" onClick={onClose} className="secondary-btn">
            Cancel
          </button>
          <button type="submit">{isSubmitting ? "Saving..." : isEdit ? "Save" : "Add"}</button>
        </div>
      </form>
    </Modal>
  );
}

function SuppliersPage() {
  const [rows, setRows] = useState([]);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchCollection("suppliers").then(setRows);
  }, []);

  const handleSave = async (values) => {
    if (editing) {
      const updated = await updateItem("suppliers", editing.id, values);
      setRows((prev) => prev.map((item) => (item.id === editing.id ? updated : item)));
    } else {
      const created = await addItem("suppliers", values);
      setRows((prev) => [created, ...prev]);
    }
    setIsOpen(false);
  };

  const filtered = rows.filter((row) =>
    row.suppliersInfo.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <section className="card">
      <h2>All suppliers</h2>
      <FilterBar placeholder="User Name" value={input} setValue={setInput} onFilter={() => setSearch(input)} />
      <button
        type="button"
        className="add-btn"
        onClick={() => {
          setEditing(null);
          setIsOpen(true);
        }}
      >
        + Add a new supplier
      </button>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Suppliers Info</th>
              <th>Address</th>
              <th>Company</th>
              <th>Delivery date</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id}>
                <td>{item.suppliersInfo}</td>
                <td>
                  <EllipsisText text={item.address} length={20} />
                </td>
                <td>
                  <EllipsisText text={item.company} length={18} />
                </td>
                <td>{item.deliveryDate}</td>
                <td>{formatCurrency(item.amount)}</td>
                <td>{item.status}</td>
                <td className="actions-cell">
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => {
                      setEditing(item);
                      setIsOpen(true);
                    }}
                    aria-label="Edit supplier"
                  >
                    <Icon name="edit" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 ? tableEmpty : null}
      </div>

      <SupplierModal open={isOpen} initialValues={editing} onClose={() => setIsOpen(false)} onSubmit={handleSave} />
    </section>
  );
}

function CustomersPage() {
  const [rows, setRows] = useState([]);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 4;

  useEffect(() => {
    fetchCollection("customers").then(setRows);
  }, []);

  const filtered = rows.filter((row) => row.userInfo.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const clampedPage = Math.min(page, totalPages);
  const currentRows = filtered.slice((clampedPage - 1) * pageSize, clampedPage * pageSize);

  return (
    <section className="card">
      <h2>Customers Data</h2>
      <FilterBar
        placeholder="User Name"
        value={input}
        setValue={setInput}
        onFilter={() => {
          setSearch(input);
          setPage(1);
        }}
      />
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>User Info</th>
              <th>Email</th>
              <th>Address</th>
              <th>Phone</th>
              <th>Register date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentRows.map((item) => (
              <tr key={item.id}>
                <td>{item.userInfo}</td>
                <td>{item.email}</td>
                <td>
                  <EllipsisText text={item.address} length={20} />
                </td>
                <td>{item.phone}</td>
                <td>{item.registerDate}</td>
                <td className="actions-cell">
                  <button type="button" className="icon-btn" aria-label="Edit customer">
                    <Icon name="edit" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {currentRows.length === 0 ? tableEmpty : null}
      </div>

      <div className="pagination">
        <button type="button" onClick={() => setPage((prev) => Math.max(1, Math.min(prev, totalPages) - 1))}>
          Prev
        </button>
        <span>
          {clampedPage} / {totalPages}
        </span>
        <button
          type="button"
          onClick={() => setPage((prev) => Math.min(totalPages, Math.min(prev, totalPages) + 1))}
        >
          Next
        </button>
      </div>
    </section>
  );
}

function NotFoundPage() {
  return (
    <section className="card">
      <h2>Page not found</h2>
      <Link className="add-btn" to="/dashboard">
        Back to dashboard
      </Link>
    </section>
  );
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<SharedLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/home" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/suppliers" element={<SuppliersPage />} />
            <Route path="/customers" element={<CustomersPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
