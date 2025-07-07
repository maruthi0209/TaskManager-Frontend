// // Taskflow/client/src/components/GoogleSignInButton.jsx
// import React, { useContext } from 'react';
// import axios from 'axios';
// import { auth, googleProvider } from './firebase'; // Import auth and provider
// import { signInWithPopup } from 'firebase/auth'; // Import signInWithPopup
// import AuthContext from './context/authContext'; // Your AuthContext

// const GoogleSignInButton = () => {
//   const { login } = useContext(AuthContext);

//   const handleGoogleSignIn = async () => {
//     try {
//       const result = await signInWithPopup(auth, googleProvider);
//       // The `result.user` object contains the Firebase User info.
//       // `getIdToken()` gets the Firebase ID token for your backend.
//       const firebaseIdToken = await result.user.getIdToken();

//       console.log('Firebase User:', result.user);
//       console.log('Firebase ID Token:', firebaseIdToken);

//       // Send the Firebase ID token to your backend for verification
//       const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/google-firebase`, {
//         firebaseIdToken: firebaseIdToken,
//       });

//       // Assuming your backend sends back your app's JWT and user data
//       console.log('Backend response:', res.data);
//       if (res.data.token) {
//         login(res.data.token, res.data.user);
//         alert('Google Login Successful via Firebase!');
//         // Redirect or update UI as needed
//       }
//     } catch (error) {
//       console.error('Google login error (Firebase frontend):', error);
//       alert('Google Login Failed: ' + (error.message || 'Check console.'));
//       // Handle specific errors like 'auth/popup-closed-by-user'
//       if (error.code === 'auth/popup-closed-by-user') {
//         console.warn('Google sign-in popup closed by user.');
//       }
//     }
//   };

//   return (
//     <div>
//       <button
//         onClick={handleGoogleSignIn}
//         style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}
//       >
//         Sign in with Google (Firebase)
//       </button>
//     </div>
//   );
// };

// export default GoogleSignInButton;