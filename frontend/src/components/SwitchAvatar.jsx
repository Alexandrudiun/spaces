import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";

const SwitchAvatar = ({ currentAvatar, onAvatarUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [avatars, setAvatars] = useState([]);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isModalOpen) {
      fetchAvatars();
    }
  }, [isModalOpen]);

  const fetchAvatars = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch all 10 avatar images
      const avatarUrls = [];
      for (let i = 1; i <= 10; i++) {
        avatarUrls.push(`https://molsongbsspaces.onrender.com/images/av${i}.avif`);
      }
      setAvatars(avatarUrls);
    } catch (err) {
      setError("Failed to load avatars. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedAvatar) return;

    setIsSaving(true);
    setError(null);

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user?._id || user?.id;
      const token = localStorage.getItem("token");

      const response = await fetch(`https://molsongbsspaces.onrender.com/api/user/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          image: selectedAvatar,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server response:", errorText);
        throw new Error(`Failed to update avatar: ${response.status} ${response.statusText}`);
      }

      // Try to parse JSON response, but don't fail if it's not JSON
      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      }

      // Update parent component with new avatar URL
      if (onAvatarUpdate) {
        onAvatarUpdate(selectedAvatar);
      }

      // Close modal and reset state
      setIsModalOpen(false);
      setSelectedAvatar(null);
    } catch (err) {
      console.error("Avatar update error:", err);
      setError(err.message || "Failed to save avatar. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setSelectedAvatar(null);
    setError(null);
  };

  return (
    <>
      {/* Change Avatar Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          width: '100%',
          padding: '0.75rem 1rem',
          background: 'rgba(0, 103, 172, 0.2)',
          color: '#F6DD58',
          border: '1px solid rgba(246, 221, 88, 0.3)',
          borderRadius: '8px',
          fontSize: '0.875rem',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.target.style.background = 'rgba(0, 103, 172, 0.3)';
          e.target.style.borderColor = '#F6DD58';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'rgba(0, 103, 172, 0.2)';
          e.target.style.borderColor = 'rgba(246, 221, 88, 0.3)';
        }}
      >
        <svg 
          width="16" 
          height="16" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
          />
        </svg>
        Change Avatar
      </button>

      {/* Modal */}
      {isModalOpen && createPortal(
        <AnimatePresence>
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCancel}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                backdropFilter: "blur(4px)",
                zIndex: 9998,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: "-50%", y: "calc(-50% + 20px)" }}
              animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
              exit={{ opacity: 0, scale: 0.9, x: "-50%", y: "calc(-50% + 20px)" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                background: "linear-gradient(to bottom, #2d3748, #1a202c)",
                borderRadius: "16px",
                border: "2px solid rgba(246, 221, 88, 0.3)",
                padding: "30px",
                width: "90%",
                maxWidth: "500px",
                maxHeight: "90vh",
                overflowY: "auto",
                zIndex: 9999,
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "25px",
                  paddingBottom: "15px",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <h2
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: "#F6DD58",
                    margin: 0,
                  }}
                >
                  Change Avatar
                </h2>
                <button
                  onClick={handleCancel}
                  style={{
                    background: "rgba(255, 255, 255, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    fontSize: "24px",
                    color: "#F6DD58",
                    cursor: "pointer",
                    padding: "0",
                    width: "32px",
                    height: "32px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "rgba(246, 221, 88, 0.2)";
                    e.target.style.borderColor = "#F6DD58";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
                    e.target.style.borderColor = "rgba(255, 255, 255, 0.2)";
                  }}
                >
                  ×
                </button>
              </div>

              {/* Preview Section */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  marginBottom: "25px",
                }}
              >
                <div
                  style={{
                    width: "150px",
                    height: "150px",
                    borderRadius: "50%",
                    overflow: "hidden",
                    border: "4px solid #F6DD58",
                    marginBottom: "20px",
                    backgroundColor: "rgba(0, 103, 172, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {selectedAvatar ? (
                    <img
                      src={selectedAvatar}
                      alt="Selected avatar"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : currentAvatar ? (
                    <img
                      src={currentAvatar}
                      alt="Current avatar"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        fontSize: "48px",
                        color: "#F6DD58",
                        fontWeight: "bold",
                      }}
                    >
                      ?
                    </div>
                  )}
                </div>

                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#F6DD58",
                    marginBottom: "15px",
                  }}
                >
                  Choose Your Avatar
                </h3>

                {/* Avatar Grid */}
                {isLoading ? (
                  <div
                    style={{
                      padding: "40px",
                      color: "#F6DD58",
                      fontSize: "14px",
                    }}
                  >
                    Loading avatars...
                  </div>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(5, 1fr)",
                      gap: "12px",
                      width: "100%",
                      marginBottom: "10px",
                    }}
                  >
                    {avatars.map((avatarUrl, index) => (
                      <div
                        key={index}
                        onClick={() => setSelectedAvatar(avatarUrl)}
                        style={{
                          width: "70px",
                          height: "70px",
                          borderRadius: "50%",
                          overflow: "hidden",
                          border:
                            selectedAvatar === avatarUrl
                              ? "3px solid #F6DD58"
                              : "3px solid rgba(255, 255, 255, 0.2)",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                          backgroundColor: "rgba(0, 103, 172, 0.2)",
                          boxShadow:
                            selectedAvatar === avatarUrl
                              ? "0 4px 12px rgba(246, 221, 88, 0.5)"
                              : "0 2px 4px rgba(0, 0, 0, 0.3)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "scale(1.1)";
                          e.currentTarget.style.borderColor = "#F6DD58";
                          e.currentTarget.style.boxShadow =
                            "0 4px 12px rgba(246, 221, 88, 0.4)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "scale(1)";
                          e.currentTarget.style.borderColor =
                            selectedAvatar === avatarUrl
                              ? "#F6DD58"
                              : "rgba(255, 255, 255, 0.2)";
                          e.currentTarget.style.boxShadow =
                            selectedAvatar === avatarUrl
                              ? "0 4px 12px rgba(246, 221, 88, 0.5)"
                              : "0 2px 4px rgba(0, 0, 0, 0.3)";
                        }}
                      >
                        <img
                          src={avatarUrl}
                          alt={`Avatar ${index + 1}`}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div
                  style={{
                    padding: "12px",
                    background: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    borderRadius: "8px",
                    color: "#fca5a5",
                    fontSize: "14px",
                    marginBottom: "20px",
                  }}
                >
                  {error}
                </div>
              )}

              {/* Action Buttons */}
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  style={{
                    padding: "12px 24px",
                    background: "rgba(255, 255, 255, 0.1)",
                    color: "#a0aec0",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: isSaving ? "not-allowed" : "pointer",
                    opacity: isSaving ? 0.5 : 1,
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSaving) {
                      e.target.style.background = "rgba(255, 255, 255, 0.15)";
                      e.target.style.color = "white";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "rgba(255, 255, 255, 0.1)";
                    e.target.style.color = "#a0aec0";
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!selectedAvatar || isSaving}
                  style={{
                    padding: "12px 24px",
                    background:
                      !selectedAvatar || isSaving
                        ? "rgba(160, 174, 192, 0.3)"
                        : "linear-gradient(135deg, #0067AC 0%, #002147 100%)",
                    color: !selectedAvatar || isSaving ? "#4a5568" : "#F6DD58",
                    border: !selectedAvatar || isSaving 
                      ? "1px solid rgba(160, 174, 192, 0.3)"
                      : "1px solid rgba(246, 221, 88, 0.3)",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor:
                      !selectedAvatar || isSaving ? "not-allowed" : "pointer",
                    transition: "all 0.3s ease",
                    boxShadow:
                      !selectedAvatar || isSaving
                        ? "none"
                        : "0 4px 15px rgba(246, 221, 88, 0.3)",
                  }}
                  onMouseEnter={(e) => {
                    if (selectedAvatar && !isSaving) {
                      e.target.style.borderColor = "#F6DD58";
                      e.target.style.boxShadow =
                        "0 6px 20px rgba(246, 221, 88, 0.4)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedAvatar && !isSaving) {
                      e.target.style.borderColor = "rgba(246, 221, 88, 0.3)";
                      e.target.style.boxShadow =
                        "0 4px 15px rgba(246, 221, 88, 0.3)";
                    }
                  }}
                >
                  {isSaving ? "Saving..." : "Save Avatar"}
                </button>
              </div>
            </motion.div>
          </>
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export default SwitchAvatar;