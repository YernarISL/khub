import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Lock,
  Mail,
  User,
} from "lucide-react";
import { login, registration, getCurrentUser } from "../../services/userService";
import { useAuthStore } from "../../app/store";
import authBackground from "../../assets/auth-bg.png";
import "./auth-page.css";

const SIGN_IN_TAB = "signin";
const SIGN_UP_TAB = "signup";

const AuthPage = ({ initialTab = SIGN_IN_TAB }) => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const normalizedInitialTab = useMemo(
    () => (initialTab === SIGN_UP_TAB ? SIGN_UP_TAB : SIGN_IN_TAB),
    [initialTab]
  );

  const [activeTab, setActiveTab] = useState(normalizedInitialTab);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isRegistrationLoading, setIsRegistrationLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const [loginData, setLoginData] = useState({
    identifier: "",
    password: "",
  });

  const [registrationData, setRegistrationData] = useState({
    firstName: "",
    secondName: "",
    username: "",
    email: "",
    password: "",
  });

  const switchTab = (tab) => {
    setActiveTab(tab);
    setFormError("");
    setFormSuccess("");
  };

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    setFormSuccess("");
    setIsLoginLoading(true);

    try {
      await login({
        username: loginData.identifier.trim(),
        password: loginData.password,
      });

      const user = await getCurrentUser();
      setAuth(user);
      navigate("/home");
    } catch (error) {
      const message =
        error?.response?.data?.message || "Unable to sign in. Please try again.";
      setFormError(message);
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleRegistrationSubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    setFormSuccess("");
    setIsRegistrationLoading(true);

    try {
      const response = await registration({
        ...registrationData,
        firstName: registrationData.firstName.trim(),
        secondName: registrationData.secondName.trim(),
        username: registrationData.username.trim(),
        email: registrationData.email.trim(),
      });

      setFormSuccess(
        response?.data?.message || "Account created successfully. Please sign in."
      );
      setRegistrationData({
        firstName: "",
        secondName: "",
        username: "",
        email: "",
        password: "",
      });
      setActiveTab(SIGN_IN_TAB);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        "Unable to create account. Please check your data.";
      setFormError(message);
    } finally {
      setIsRegistrationLoading(false);
    }
  };

  return (
    <div className="auth-page-shell">
      <div className="auth-page-branding">
        <img
          src={authBackground}
          alt="Abstract network background"
          className="auth-page-branding-image"
        />
        <div className="auth-page-branding-overlay" />
        <div className="auth-page-branding-content">
          <div className="auth-page-logo-wrap">
            <span className="auth-page-logo-text">Axiom</span>
          </div>

          <h1 className="auth-page-title">
            Accelerate your
            <br />
            research journey.
          </h1>
          <p className="auth-page-subtitle">
            Join thousands of researchers and students collaborating, analyzing
            data, and discovering new frontiers in education.
          </p>

          <ul className="auth-page-benefits">
            <li>
              <CheckCircle2 size={18} />
              <span>Access millions of academic papers</span>
            </li>
            <li>
              <CheckCircle2 size={18} />
              <span>AI-powered analytics and summarization</span>
            </li>
            <li>
              <CheckCircle2 size={18} />
              <span>Collaborate seamlessly with peers</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="auth-page-form-area">
        <div className="auth-page-form-card">
          <div className="auth-page-form-heading">
            <h2>Welcome back</h2>
            <p>Enter your details to access your workspace.</p>
          </div>

          <div className="auth-page-tabs">
            <button
              type="button"
              className={`auth-page-tab-btn ${activeTab === SIGN_IN_TAB ? "is-active" : ""}`}
              onClick={() => switchTab(SIGN_IN_TAB)}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`auth-page-tab-btn ${activeTab === SIGN_UP_TAB ? "is-active" : ""}`}
              onClick={() => switchTab(SIGN_UP_TAB)}
            >
              Create Account
            </button>
          </div>

          {activeTab === SIGN_IN_TAB && (
            <form
              key="signin-form"
              className="auth-page-form auth-page-form-animated"
              onSubmit={handleLoginSubmit}
            >
              <div className="auth-page-field-group">
                <label htmlFor="auth-signin-identifier">Email address</label>
                <div className="auth-page-field">
                  <Mail size={18} />
                  <input
                    id="auth-signin-identifier"
                    name="identifier"
                    type="text"
                    placeholder="name@university.edu"
                    value={loginData.identifier}
                    onChange={(event) =>
                      setLoginData((prev) => ({
                        ...prev,
                        identifier: event.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </div>

              <div className="auth-page-field-group">
                <div className="auth-page-label-row">
                  <label htmlFor="auth-signin-password">Password</label>
                  <button type="button" className="auth-page-link-btn">
                    Forgot password?
                  </button>
                </div>
                <div className="auth-page-field">
                  <Lock size={18} />
                  <input
                    id="auth-signin-password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={(event) =>
                      setLoginData((prev) => ({
                        ...prev,
                        password: event.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="auth-page-submit-btn"
                disabled={isLoginLoading}
              >
                <span>{isLoginLoading ? "Signing in..." : "Sign In"}</span>
                {!isLoginLoading && <ArrowRight size={16} />}
              </button>
            </form>
          )}

          {activeTab === SIGN_UP_TAB && (
            <form
              key="signup-form"
              className="auth-page-form auth-page-form-animated"
              onSubmit={handleRegistrationSubmit}
            >
              <div className="auth-page-name-grid">
                <div className="auth-page-field-group">
                  <label htmlFor="auth-signup-firstname">First Name</label>
                  <div className="auth-page-field">
                    <User size={18} />
                    <input
                      id="auth-signup-firstname"
                      name="firstName"
                      type="text"
                      placeholder="Jane"
                      value={registrationData.firstName}
                      onChange={(event) =>
                        setRegistrationData((prev) => ({
                          ...prev,
                          firstName: event.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                </div>

                <div className="auth-page-field-group">
                  <label htmlFor="auth-signup-secondname">Last Name</label>
                  <input
                    id="auth-signup-secondname"
                    name="secondName"
                    type="text"
                    placeholder="Doe"
                    className="auth-page-plain-input"
                    value={registrationData.secondName}
                    onChange={(event) =>
                      setRegistrationData((prev) => ({
                        ...prev,
                        secondName: event.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </div>

              <div className="auth-page-field-group">
                <label htmlFor="auth-signup-username">Username</label>
                <input
                  id="auth-signup-username"
                  name="username"
                  type="text"
                  placeholder="Enter your username"
                  className="auth-page-plain-input"
                  value={registrationData.username}
                  onChange={(event) =>
                    setRegistrationData((prev) => ({
                      ...prev,
                      username: event.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="auth-page-field-group">
                <label htmlFor="auth-signup-email">Email address</label>
                <div className="auth-page-field">
                  <Mail size={18} />
                  <input
                    id="auth-signup-email"
                    name="email"
                    type="email"
                    placeholder="name@university.edu"
                    value={registrationData.email}
                    onChange={(event) =>
                      setRegistrationData((prev) => ({
                        ...prev,
                        email: event.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </div>

              <div className="auth-page-field-group">
                <label htmlFor="auth-signup-password">Password</label>
                <div className="auth-page-field">
                  <Lock size={18} />
                  <input
                    id="auth-signup-password"
                    name="password"
                    type="password"
                    placeholder="Create a strong password"
                    value={registrationData.password}
                    onChange={(event) =>
                      setRegistrationData((prev) => ({
                        ...prev,
                        password: event.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="auth-page-submit-btn"
                disabled={isRegistrationLoading}
              >
                <span>
                  {isRegistrationLoading ? "Creating account..." : "Create Account"}
                </span>
                {!isRegistrationLoading && <ArrowRight size={16} />}
              </button>
            </form>
          )}

          {(formError || formSuccess) && (
            <p className={`auth-page-feedback ${formError ? "is-error" : "is-success"}`}>
              {formError || formSuccess}
            </p>
          )}

          <div className="auth-page-divider">
            <span>Or continue with</span>
          </div>

          <button type="button" className="auth-page-provider-btn" disabled>
            Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
