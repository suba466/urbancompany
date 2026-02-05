import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CategoryForm from './CategoryForm';
import Categories from './Categories';
import API_URL from './config';

function CategoryManagement({ isAdding, isEditing }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectAllCategories, setSelectAllCategories] = useState(false);
  const [categoryPage, setCategoryPage] = useState(1);
  const [categoryTotalPages, setCategoryTotalPages] = useState(1);
  const [categoryPerPage, setCategoryPerPage] = useState(10);
  const [categoryTotalItems, setCategoryTotalItems] = useState(0);
  const [categorySearch, setCategorySearch] = useState('');
  const [loading, setLoading] = useState(false);

  // For editing - simplified approach
  const [isEditingCategory, setIsEditingCategory] = useState(isAdding || isEditing || false);
  const [editCategory, setEditCategory] = useState(null);

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

  const fetchCategories = async (page = 1, search = '', perPage = categoryPerPage) => {
    try {
      setLoading(true);
      console.log(`Fetching categories... Page: ${page}, Search: ${search}, PerPage: ${perPage}`);

      let url = `${API_URL}/api/admin/categories?page=${page}&limit=${perPage}&sort=-createdAt`;

      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }

      const response = await fetch(url, {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        console.error("Failed to fetch categories:", response.status);
        setCategories([]);
        return;
      }

      const data = await response.json();
      console.log("Categories API response:", data);

      if (data.success && data.categories && Array.isArray(data.categories)) {
        console.log(`Found ${data.categories.length} categories`);

        const formattedCategories = data.categories.map(category => ({
          ...category,
          img: category.img || '/assets/default-category.png'
        }));

        setCategories(formattedCategories);

        // Save categories to localStorage for edit access
        localStorage.setItem('categoriesCache', JSON.stringify(formattedCategories));

        // Set pagination data if available
        if (data.pagination) {
          setCategoryTotalPages(data.pagination.pages || 1);
          setCategoryTotalItems(data.pagination.total || 0);
          setCategoryPerPage(data.pagination.limit || perPage);
          setCategoryPage(data.pagination.page || page);
        }
      } else {
        console.error("Invalid response format:", data);
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // NEW: Get category for edit from cache or current state
  const getCategoryForEdit = (categoryId) => {
    // First check in current categories state
    const categoryFromState = categories.find(cat => cat._id === categoryId);
    if (categoryFromState) {
      return categoryFromState;
    }

    // Then check localStorage cache
    const cachedCategories = JSON.parse(localStorage.getItem('categoriesCache') || '[]');
    const categoryFromCache = cachedCategories.find(cat => cat._id === categoryId);

    return categoryFromCache || null;
  };

  useEffect(() => {
    if (isEditing && id) {
      // For edit mode, get category data from cache/state
      const category = getCategoryForEdit(id);
      if (category) {
        setEditCategory(category);
      } else {
        console.warn("Category not found in cache, fetching fresh data...");
        // If not in cache, fetch categories list first
        fetchCategories().then(() => {
          const categoryAfterFetch = getCategoryForEdit(id);
          if (categoryAfterFetch) {
            setEditCategory(categoryAfterFetch);
          } else {
            alert("Category not found. Redirecting to categories list.");
            navigate('/admin/categories');
          }
        });
      }
    } else if (!isAdding && !isEditing) {
      // Normal mode - fetch categories list
      fetchCategories();
    }
  }, [isAdding, isEditing, id]);

  // Category selection handlers
  const handleCategorySelect = (categoryId) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const handleSelectAllCategories = () => {
    if (selectAllCategories) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(categories.map(c => c._id));
    }
    setSelectAllCategories(!selectAllCategories);
  };

  // Update category status - FIXED: Don't refetch after update
  const updateCategoryStatus = async (categoryId, isActive) => {
    try {
      console.log(`Updating category ${categoryId} status to: ${isActive}`);

      // Update local state immediately for better UX
      setCategories(prevCategories =>
        prevCategories.map(category =>
          category._id === categoryId
            ? { ...category, isActive }
            : category
        )
      );

      // Update cache if exists
      const cachedCategories = JSON.parse(localStorage.getItem('categoriesCache') || '[]');
      const updatedCache = cachedCategories.map(cat =>
        cat._id === categoryId ? { ...cat, isActive } : cat
      );
      localStorage.setItem('categoriesCache', JSON.stringify(updatedCache));

      // Make API call in background
      const response = await fetch(`${API_URL}/api/admin/categories/${categoryId}/toggle-status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ isActive })
      });

      const data = await response.json();

      if (!data.success) {
        console.error("Failed to update category status:", data.error);
        // Revert local state if API call fails
        setCategories(prevCategories =>
          prevCategories.map(category =>
            category._id === categoryId
              ? { ...category, isActive: !isActive }
              : category
          )
        );

        // Show error toast or message (optional)
        alert(`Failed to update status: ${data.error || 'Unknown error'}`);
      } else {
        console.log("Status updated successfully on server");
      }
    } catch (error) {
      console.error('Error updating category status:', error);

      // Revert local state if API call fails
      setCategories(prevCategories =>
        prevCategories.map(category =>
          category._id === categoryId
            ? { ...category, isActive: !isActive }
            : category
        )
      );

      alert('Failed to update status due to network error');
    }
  };

  // Delete category
  const deleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        const response = await fetch(`${API_URL}/api/admin/categories/${categoryId}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });

        const data = await response.json();
        if (data.success) {
          alert('Category deleted successfully');
          // Remove from local state
          setCategories(prev => prev.filter(cat => cat._id !== categoryId));
          // Remove from selected if selected
          setSelectedCategories(prev => prev.filter(id => id !== categoryId));
        } else {
          alert(data.error || 'Failed to delete category');
        }
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Failed to delete category');
      }
    }
  };

  // Bulk delete categories
  const handleBulkDeleteCategories = async (selectedIds) => {
    if (selectedIds.length === 0) return;

    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} category(ies)?`)) {
      try {
        const response = await fetch(`${API_URL}/api/admin/categories/bulk-delete`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ ids: selectedIds })
        });

        const data = await response.json();
        if (data.success) {
          alert(`Successfully deleted ${data.deletedCount} category(ies)`);
          // Remove from local state
          setCategories(prev => prev.filter(cat => !selectedIds.includes(cat._id)));
          // Clear selection
          setSelectedCategories([]);
          setSelectAllCategories(false);
        } else {
          alert(data.error || 'Failed to delete categories');
        }
      } catch (error) {
        console.error('Error bulk deleting categories:', error);
        alert('Failed to delete categories');
      }
    }
  };

  // Handle category form submission
  const handleCategorySubmit = async (formData, imageFile) => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('key', formData.key || formData.name.toLowerCase().replace(/ /g, '-'));
      formDataToSend.append('order', formData.order || 0);
      formDataToSend.append('isActive', formData.isActive !== undefined ? formData.isActive : true);

      if (imageFile) {
        formDataToSend.append('image', imageFile);
      } else if (isEditing && editCategory?.img) {
        formDataToSend.append('img', editCategory.img);
      }

      const url = isEditing
        ? `${API_URL}/api/admin/categories/${editCategory._id}`
        : `${API_URL}/api/admin/categories`;

      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: formDataToSend
      });

      const result = await response.json();

      if (result.success) {
        alert(isEditing ? 'Category updated successfully!' : 'Category added successfully!');
        // Navigate back to categories list only if editing
        if (isEditing) {
          navigate('/admin/categories');
        }
      } else {
        alert(result.error || `Failed to ${isEditing ? 'update' : 'add'} category`);
      }
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'adding'} category:`, error);
      alert(`Failed to ${isEditing ? 'update' : 'add'} category`);
    }
  };

  // Handle edit click
  const handleEditCategory = (category) => {
    console.log("Edit clicked for:", category.name);

    // Store the category data in localStorage temporarily
    localStorage.setItem('editingCategory', JSON.stringify(category));

    // Navigate to edit route
    navigate(`/admin/categories/edit/${category._id}`);
  };

  // Handle cancel
  const handleCancel = () => {
    // Clear editing data
    localStorage.removeItem('editingCategory');
    navigate('/admin/categories');
  };

  // Check if we're in edit mode with stored data
  useEffect(() => {
    if (isEditing && !editCategory) {
      // Check if category data was passed via localStorage
      const storedCategory = localStorage.getItem('editingCategory');
      if (storedCategory) {
        try {
          const parsedCategory = JSON.parse(storedCategory);
          setEditCategory(parsedCategory);
        } catch (e) {
          console.error("Failed to parse stored category:", e);
        }
      }
    }
  }, [isEditing, editCategory]);

  // If we're adding or editing, show the form
  if (isAdding || isEditing) {
    return (
      <CategoryForm
        isEditing={isEditing}
        categoryData={editCategory}
        onSubmit={handleCategorySubmit}
        onCancel={handleCancel}
      />
    );
  }

  // Normal mode - show categories list
  return (
    <Categories
      categories={categories}
      selectedCategories={selectedCategories}
      selectAllCategories={selectAllCategories}
      onSelect={handleCategorySelect}
      onSelectAll={handleSelectAllCategories}
      onEdit={handleEditCategory}
      onDelete={deleteCategory}
      onToggleStatus={updateCategoryStatus}

      // Pagination props
      currentPage={categoryPage}
      totalPages={categoryTotalPages}
      totalItems={categoryTotalItems}
      onPageChange={(page) => {
        setCategoryPage(page);
        fetchCategories(page, categorySearch, categoryPerPage);
      }}

      // Search props
      searchQuery={categorySearch}
      onSearchChange={(value) => {
        setCategorySearch(value);
        fetchCategories(1, value, categoryPerPage);
      }}

      itemsPerPage={categoryPerPage}
      onItemsPerPageChange={(perPage) => {
        setCategoryPerPage(perPage);
        fetchCategories(1, categorySearch, perPage);
      }}

      loading={loading}
    />
  );
}

export default CategoryManagement;