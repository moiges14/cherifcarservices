useEffect(() => {
    if (user) {
      loadSavedLocations();
      loadUserProfile();
    }
  }, [user]);

  useEffect(() => {
    if (formData.pickup && formData.destination && selectedOption && window.google?.maps) {
      calculateDistanceAndPrice();
    }
  }, [formData.pickup, formData.destination, selectedOption]);