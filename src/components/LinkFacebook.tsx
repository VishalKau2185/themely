import { useEffect } from "react";

declare global {
  interface Window {
    FB: any;
  }
}

export default function LinkFacebook() {
  useEffect(() => {
    window.FB.init({
      appId: import.meta.env.VITE_FACEBOOK_APP_ID,
      cookie: true,
      xfbml: false,
      version: 'v18.0'
    });
  }, []);

  const handleLink = () => {
    window.FB.login(function (response: any) {
      if (response.authResponse) {
        const { accessToken, userID } = response.authResponse;

        // Send to Supabase function
        fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/link-facebook`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("supabase.auth.token")}` // or get from supabase.auth
          },
          body: JSON.stringify({ accessToken, userID }),
        })
        .then((res) => res.json())
        .then((data) => console.log("Linked:", data))
        .catch(console.error);
      } else {
        console.warn("Facebook login failed");
      }
    }, { scope: 'email' });
  };

  return (
    <button onClick={handleLink}>
      Link Facebook Account
    </button>
  );
}
