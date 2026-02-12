import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SubcategoryForm from './SubcategoryForm';
import Subcategories from './Subcategories';
import { Button, Modal, Form } from 'react-bootstrap';

function SubcategoryManagement({ isAdding, isEditing }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [selectAllSubcategories, setSelectAllSubcategories] = useState(false);
  const [subcategoryPage, setSubcategoryPage] = useState(1);
  const [subcategoryTotalPages, setSubcategoryTotalPages] = useState(1);
  const [subcategoryPerPage, setSubcategoryPerPage] = useState(10);
  const [subcategoryTotalItems, setSubcategoryTotalItems] = useState(0);
  const [subcategorySearch, setSubcategorySearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Categories for dropdown
  const [categories, setCategories] = useState([]);

  // For editing - simplified
  const [isEditingSubcategory, setIsEditingSubcategory] = useState(isAdding || isEditing || false);
  const [editSubcategory, setEditSubcategory] = useState(null);

  // For view modal
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingSubcategory, setViewingSubcategory] = useState(null);

  const getAuthToken = () => {
    return localStorage.getItem('adminToken');
  };

  const getAuthHeaders = () => {
    const token = getAuthToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${window.API_URL}/api/admin/categories?limit=1000&isActive=true`, {
        headers: getAuthHeaders()
      });

      const data = await response.json();
      if (data.success && data.categories) {
        setCategories(data.categories.filter(cat => cat.isActive));
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchSubcategories = async (page = 1, search = '', perPage = subcategoryPerPage) => {
    try {
      setLoading(true);
      console.log(`Fetching subcategories... Page: ${page}, Search: ${search}, PerPage: ${perPage}`);

      let url = `${window.API_URL}/api/admin/subcategories?page=${page}&limit=${perPage}&sort=-createdAt`;

      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }

      const response = await fetch(url, {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        console.error("Failed to fetch subcategories:", response.status);
        setSubcategories([]);
        return;
      }

      const data = await response.json();
      console.log("Subcategories API response:", data);

      if (data.success && data.subcategories && Array.isArray(data.subcategories)) {
        console.log(`Found ${data.subcategories.length} subcategories`);

        const formattedSubcategories = data.subcategories.map(sub => ({
          ...sub,
          img: sub.img || '/assets/default-subcategory.png',
          categoryName: sub.categoryId?.name || sub.categoryName || 'Unknown'
        }));

        setSubcategories(formattedSubcategories);

        // Cache subcategories for edit access
        localStorage.setItem('subcategoriesCache', JSON.stringify(formattedSubcategories));

        // Set pagination data if available
        if (data.pagination) {
          setSubcategoryTotalPages(data.pagination.pages || 1);
          setSubcategoryTotalItems(data.pagination.total || 0);
          setSubcategoryPerPage(data.pagination.limit || perPage);
          setSubcategoryPage(data.pagination.page || page);
        }
      } else {
        console.error("Invalid response format:", data);
        setSubcategories([]);
      }
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      setSubcategories([]);
    } finally {
      setLoading(false);
    }
  };

  // Get subcategory for edit from cache or current state
  const getSubcategoryForEdit = (subcategoryId) => {
    // First check in current state
    const subcategoryFromState = subcategories.find(sub => sub._id === subcategoryId);
    if (subcategoryFromState) {
      return subcategoryFromState;
    }

    // Then check localStorage cache
    const cachedSubcategories = JSON.parse(localStorage.getItem('subcategoriesCache') || '[]');
    const subcategoryFromCache = cachedSubcategories.find(sub => sub._id === subcategoryId);

    return subcategoryFromCache || null;
  };

  useEffect(() => {
    fetchCategories();

    if (isEditing && id) {
      // For edit mode, get subcategory from cache
      const subcategory = getSubcategoryForEdit(id);
      if (subcategory) {
        setEditSubcategory(subcategory);
      } else {
        console.warn("Subcategory not found in cache, fetching fresh data...");
        // If not in cache, fetch subcategories list first
        fetchSubcategories().then(() => {
          const subcategoryAfterFetch = getSubcategoryForEdit(id);
          if (subcategoryAfterFetch) {
            setEditSubcategory(subcategoryAfterFetch);
          } else {
            alert("Subcategory not found. Redirecting to subcategories list.");
            navigate('/admin/subcategories');
          }
        });
      }
    } else if (!isAdding && !isEditing) {
      // Normal mode - fetch subcategories list
      fetchSubcategories();
    }
  }, [isAdding, isEditing, id]);

  // Subcategory selection handlers
  const handleSubcategorySelect = (subcategoryId) => {
    setSelectedSubcategories(prev => {
      if (prev.includes(subcategoryId)) {
        return prev.filter(id => id !== subcategoryId);
      } else {
        return [...prev, subcategoryId];
      }
    });
  };

  const handleSelectAllSubcategories = () => {
    if (selectAllSubcategories) {
      setSelectedSubcategories([]);
    } else {
      setSelectedSubcategories(subcategories.map(s => s._id));
    }
    setSelectAllSubcategories(!selectAllSubcategories);
  };

  // FIXED: Update subcategory status - Don't refetch after update
  const updateSubcategoryStatus = async (subcategoryId, isActive) => {
    try {
      console.log(`Updating subcategory ${subcategoryId} status to: ${isActive}`);

      // Update local state immediately for instant UI feedback
      setSubcategories(prevSubcategories =>
        prevSubcategories.map(subcategory =>
          subcategory._id === subcategoryId
            ? { ...subcategory, isActive }
            : subcategory
        )
      );

      // Also update viewing subcategory if modal is open
      if (viewingSubcategory && viewingSubcategory._id === subcategoryId) {
        setViewingSubcategory(prev => ({ ...prev, isActive }));
      }

      // Update cache if exists
      const cachedSubcategories = JSON.parse(localStorage.getItem('subcategoriesCache') || '[]');
      const updatedCache = cachedSubcategories.map(sub =>
        sub._id === subcategoryId ? { ...sub, isActive } : sub
      );
      localStorage.setItem('subcategoriesCache', JSON.stringify(updatedCache));

      // Make API call in background
      const response = await fetch(`${window.API_URL}/api/admin/subcategories/${subcategoryId}/toggle-status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ isActive })
      });

      const data = await response.json();

      if (!data.success) {
        console.error("Failed to update subcategory status:", data.error);
        // Revert local state if API call fails
        setSubcategories(prevSubcategories =>
          prevSubcategories.map(subcategory =>
            subcategory._id === subcategoryId
              ? { ...subcategory, isActive: !isActive }
              : subcategory
          )
        );

        // Show error toast or message
        alert(`Failed to update status: ${data.error || 'Unknown error'}`);
      } else {
        console.log("Status updated successfully on server");
      }
    } catch (error) {
      console.error('Error updating subcategory status:', error);

      // Revert local state if API call fails
      setSubcategories(prevSubcategories =>
        prevSubcategories.map(subcategory =>
          subcategory._id === subcategoryId
            ? { ...subcategory, isActive: !isActive }
            : subcategory
        )
      );

      alert('Failed to update status due to network error');
    }
  };

  // FIXED: Delete subcategory - Update local state instead of refetching
  const deleteSubcategory = async (subcategoryId) => {
    if (window.confirm('Are you sure you want to delete this subcategory?')) {
      try {
        const response = await fetch(`${window.API_URL}/api/admin/subcategories/${subcategoryId}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });

        const data = await response.json();
        if (data.success) {
          alert('Subcategory deleted successfully');
          // Remove from local state
          setSubcategories(prev => prev.filter(sub => sub._id !== subcategoryId));
          // Remove from selected if selected
          setSelectedSubcategories(prev => prev.filter(id => id !== subcategoryId));
          // Update cache
          const cachedSubcategories = JSON.parse(localStorage.getItem('subcategoriesCache') || '[]');
          const updatedCache = cachedSubcategories.filter(sub => sub._id !== subcategoryId);
          localStorage.setItem('subcategoriesCache', JSON.stringify(updatedCache));
        } else {
          alert(data.error || 'Failed to delete subcategory');
        }
      } catch (error) {
        console.error('Error deleting subcategory:', error);
        alert('Failed to delete subcategory');
      }
    }
  };

  // FIXED: Bulk delete subcategories - Update local state instead of refetching
  const handleBulkDeleteSubcategories = async (selectedIds) => {
    if (selectedIds.length === 0) return;

    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} subcategory(ies)?`)) {
      try {
        const response = await fetch(`${window.API_URL}/api/admin/subcategories/bulk-delete`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ ids: selectedIds })
        });

        const data = await response.json();
        if (data.success) {
          alert(`Successfully deleted ${data.deletedCount} subcategory(ies)`);
          // Remove from local state
          setSubcategories(prev => prev.filter(sub => !selectedIds.includes(sub._id)));
          // Clear selection
          setSelectedSubcategories([]);
          setSelectAllSubcategories(false);
          // Update cache
          const cachedSubcategories = JSON.parse(localStorage.getItem('subcategoriesCache') || '[]');
          const updatedCache = cachedSubcategories.filter(sub => !selectedIds.includes(sub._id));
          localStorage.setItem('subcategoriesCache', JSON.stringify(updatedCache));
        } else {
          alert(data.error || 'Failed to delete subcategories');
        }
      } catch (error) {
        console.error('Error bulk deleting subcategories:', error);
        alert('Failed to delete subcategories');
      }
    }
  };

  // Handle subcategory form submission
  const handleSubcategorySubmit = async (formData, imageFile) => {
    try {
      console.log("Form submission started...", { formData, isEditing, id, editSubcategory });

      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('categoryId', formData.categoryId);
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('key', formData.key || formData.name.toLowerCase().replace(/ /g, '-'));
      formDataToSend.append('order', formData.order || 0);
      formDataToSend.append('isActive', formData.isActive !== undefined ? formData.isActive : true);

      if (imageFile) {
        formDataToSend.append('image', imageFile);
      } else if (isEditing && editSubcategory?.img) {
        formDataToSend.append('img', editSubcategory.img);
      }

      // Determine URL
      let url;
      if (isEditing) {
        // Use id from URL params or editSubcategory._id
        const subcategoryId = id || (editSubcategory?._id);
        if (!subcategoryId) {
          throw new Error("Subcategory ID not found for editing");
        }
        url = `${window.API_URL}/api/admin/subcategories/${subcategoryId}`;
        console.log("Editing subcategory with ID:", subcategoryId);
      } else {
        url = `${window.API_URL}/api/admin/subcategories`;
        console.log("Adding new subcategory");
      }

      console.log("Making request to:", url);
      console.log("Method:", isEditing ? 'PUT' : 'POST');

      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: formDataToSend
      });

      console.log("Response status:", response.status);

      const text = await response.text();
      console.log("Response text:", text);

      let data;
      try {
        data = JSON.parse(text);
        console.log("Response data:", data);
      } catch (e) {
        console.error("Failed to parse response as JSON:", text);
        throw new Error("Invalid response from server");
      }

      if (data.success) {
        alert(`Subcategory ${isEditing ? 'updated' : 'added'} successfully!`);
        // Clear cache
        localStorage.removeItem('subcategoriesCache');
        localStorage.removeItem('editingSubcategory');
        // Navigate back to list
        navigate('/admin/subcategories');
      } else {
        throw new Error(data.error || data.message || `Failed to ${isEditing ? 'update' : 'add'} subcategory`);
      }
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'adding'} subcategory:`, error);
      alert(`Failed to ${isEditing ? 'update' : 'add'} subcategory: ${error.message}`);
    }
  };

  // Handle edit click
  const handleEditSubcategory = (subcategory) => {
    console.log("Edit clicked for:", subcategory.name);

    // Store the subcategory data in localStorage temporarily
    localStorage.setItem('editingSubcategory', JSON.stringify(subcategory));

    // Navigate to edit route
    navigate(`/admin/subcategories/edit/${subcategory._id}`);
  };

  // Handle view subcategory
  const handleViewSubcategory = (subcategory) => {
    setViewingSubcategory(subcategory);
    setShowViewModal(true);
  };

  // Handle add subcategory click
  const handleAddSubcategory = () => {
    navigate('/admin/subcategories/add');
  };

  // Handle cancel
  const handleCancel = () => {
    // Clear editing data
    localStorage.removeItem('editingSubcategory');
    navigate('/admin/subcategories');
  };

  // Check if we're in edit mode with stored data
  useEffect(() => {
    if (isEditing && !editSubcategory) {
      // Check if subcategory data was passed via localStorage
      const storedSubcategory = localStorage.getItem('editingSubcategory');
      if (storedSubcategory) {
        try {
          const parsedSubcategory = JSON.parse(storedSubcategory);
          console.log("Loaded subcategory from localStorage:", parsedSubcategory);
          setEditSubcategory(parsedSubcategory);
        } catch (e) {
          console.error("Failed to parse stored subcategory:", e);
        }
      }
    }
  }, [isEditing, editSubcategory]);

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get initials for image fallback
  const getInitials = (name) => {
    if (!name || typeof name !== 'string' || name.trim() === '') return 'NA';

    const nameParts = name.trim().split(' ').filter(part => part.length > 0);

    if (nameParts.length === 1) {
      return nameParts[0].substring(0, 2).toUpperCase();
    }

    return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
  };

  // If we're adding or editing, show the form
  if (isAdding || isEditing) {
    return (
      <div className="p-3">
        <SubcategoryForm
          categories={categories.filter(cat => cat.isActive)}
          subcategoryData={editSubcategory}
          onSubmit={handleSubcategorySubmit}
          onCancel={handleCancel}
        />
      </div>
    );
  }

  return (
    <>
      <Subcategories
        subcategories={subcategories}
        selectedSubcategories={selectedSubcategories}
        selectAllSubcategories={selectAllSubcategories}
        onSelect={handleSubcategorySelect}
        onSelectAll={handleSelectAllSubcategories}
        onEdit={handleEditSubcategory}
        onView={handleViewSubcategory}
        onDelete={deleteSubcategory}
        onBulkDelete={handleBulkDeleteSubcategories}
        onToggleStatus={updateSubcategoryStatus}

        // Pagination props
        currentPage={subcategoryPage}
        totalPages={subcategoryTotalPages}
        totalItems={subcategoryTotalItems}
        onPageChange={(page) => {
          setSubcategoryPage(page);
          fetchSubcategories(page, subcategorySearch, subcategoryPerPage);
        }}

        // Search props
        searchQuery={subcategorySearch}
        onSearchChange={(value) => {
          setSubcategorySearch(value);
          fetchSubcategories(1, value, subcategoryPerPage);
        }}

        itemsPerPage={subcategoryPerPage}
        onItemsPerPageChange={(perPage) => {
          setSubcategoryPerPage(perPage);
          fetchSubcategories(1, subcategorySearch, perPage);
        }}

        onAddSubcategory={handleAddSubcategory}
        loading={loading}
      />

      {/* View Modal - Similar to Categories modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} centered>
        <Modal.Body>

          {/* Modal Title */}
          <Modal.Title><h5>Subcategory Details</h5></Modal.Title>

          {viewingSubcategory && (
            <div>
              {/* Image Section */}
              <div className="text-center mb-4">
                <div className="mb-3">
                  {viewingSubcategory.img && viewingSubcategory.img !== '/assets/default-subcategory.png' ? (
                    <img
                      src={`${window.API_URL}${viewingSubcategory.img}`}
                      alt={viewingSubcategory.name}
                      style={{
                        width: '150px',
                        height: '150px',
                        objectFit: 'cover',
                        borderRadius: '12px',
                        border: '3px solid #dee2e6'
                      }}
                    />
                  ) : (
                    <div className='gradient'>
                      {getInitials(viewingSubcategory.name)}
                    </div>
                  )}
                </div>
                <h5 className="mb-1">{viewingSubcategory.name}</h5>
              </div>

              {/* Details in list group format */}
              <div className="list-group list-group-flush">
                {/* Subcategory Name */}
                <div className="list-group-item px-0 border-top-0">
                  <small className="text-muted d-block">Subcategory Name</small>
                  <span className="fw-semibold">{viewingSubcategory.name}</span>
                </div>

                {/* Parent Category */}
                <div className="list-group-item px-0">
                  <small className="text-muted d-block">Parent Category</small>
                  <span>{viewingSubcategory.categoryName || 'Not assigned'}</span>
                </div>

                {/* Status */}
                <div className="list-group-item px-0">
                  <small className="text-muted d-block">Status</small>
                  <div>
                    <Form.Check
                      type="switch"
                      id="modal-status-switch"
                      checked={viewingSubcategory.isActive !== false}
                      onChange={(e) => {
                        updateSubcategoryStatus(viewingSubcategory._id, e.target.checked);
                      }}
                      label={viewingSubcategory.isActive !== false ? 'Enabled' : 'Disabled'}
                      inline
                    />
                  </div>
                </div>
                {/* Image URL - At the bottom like categories modal */}
                {viewingSubcategory.img && viewingSubcategory.img !== '/assets/default-subcategory.png' && (
                  <div className="list-group-item px-0 border-bottom-0">
                    <small className="text-muted d-block">Image URL</small>
                    <small className="text-truncate d-block" style={{ maxWidth: '100%' }}>
                      {`${window.API_URL}${viewingSubcategory.img}`}
                    </small>
                  </div>
                )}
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button
            variant="secondary"
            onClick={() => setShowViewModal(false)}
            style={{ borderRadius: "50px" }}
          >
            Close
          </Button>
          <Button
            variant="dark"
            style={{ borderRadius: "50px" }}
            onClick={() => {
              setShowViewModal(false);
              handleEditSubcategory(viewingSubcategory);
            }}
          >
            Edit
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default SubcategoryManagement;
