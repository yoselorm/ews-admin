import React from 'react'
import api from '../services/Api';

const VerifyEmail = () => {
    // Inside a VerifyEmail.jsx component
useEffect(() => {
  const verify = async () => {
    try {
      // id and hash come from the URL params
      await api.get(`/admin/verify-email/${id}/${hash}`);
      setVerified(true);
    } catch (err) {
      setError("Verification link invalid or expired.");
    }
  };
  verify();
}, []);
  return (
    <div>VerifyEmail</div>
  )
}

export default VerifyEmail