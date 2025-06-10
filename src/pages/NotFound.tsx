import { Link } from "react-router-dom";
export default function NotFound() {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-9xl font-extrabold text-primary">404</h1>
          <p className="mt-4 text-2xl text-muted-foreground">
            Sorry, we couldn't find the page you're looking for
          </p>
          <Link to="/" className="mt-8 inline-block rounded-md bg-primary px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-background">
            Go back home
          </Link>
        </div>
      </div>
    );
  }
  