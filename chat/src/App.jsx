import ChatRoute from "./routes/ChatRoute.jsx";

// Additional Doorstep product sections can be registered here later without
// changing the shared app shell or the route components themselves.
const routes = [{ path: "/", component: ChatRoute }];

function resolveRoute(pathname) {
  return routes.find((route) => route.path === pathname) ?? routes[0];
}

export default function App() {
  const RouteComponent = resolveRoute(window.location.pathname).component;

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="/" aria-label="Doorstep home">
          <span className="brand-mark" aria-hidden="true">
            D
          </span>
          <span>Doorstep</span>
        </a>
        <div className="header-note">
          <span className="status-dot" aria-hidden="true" />
          Local help, thoughtfully matched
        </div>
      </header>
      <RouteComponent />
    </div>
  );
}
