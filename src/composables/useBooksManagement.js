import { ref, computed } from 'vue'
import { booksAPI, categoriesAPI, publishersAPI, bookCategoriesAPI } from '@/services/apiEndpoints'
import { handleApiError } from '@/utils/errorHandler'

export function useBooksManagement() {
  const books = ref([])
  const categories = ref([])
  const publishers = ref([])
  const searchQuery = ref('')
  const isLoading = ref(false)
  const errorMessage = ref('')

  // Filters
  const showFilters = ref(false)
  const filters = ref({
    language: '',
    publisherId: '',
    categoryId: '',
    yearFrom: null,
    yearTo: null,
    availability: ''
  })

  // Pagination
  const currentPage = ref(0)
  const pageSize = ref(12)
  const totalPages = ref(0)
  const totalElements = ref(0)

  // Modals
  const showCreateModal = ref(false)
  const showEditModal = ref(false)
  const showDeleteModal = ref(false)

  // Forms
  const form = ref({
    title: '',
    publicationYear: '',
    language: '',
    edition: '',
    quantity: 0,
    publisherId: null,
    selectedCategories: []
  })
  const formError = ref('')
  const isSubmitting = ref(false)

  // Delete
  const bookToDelete = ref(null)
  const isDeleting = ref(false)

  const filteredBooks = computed(() => {
    let result = books.value

    // Apply search query
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase().trim()
      result = result.filter(book => {
        const searchableText = [
          book.title,
          book.publisherName,
          book.language,
          book.edition,
          book.publicationYear
        ].filter(Boolean).join(' ').toLowerCase()
        
        return searchableText.includes(query)
      })
    }

    // Apply filters
    if (filters.value.language) {
      result = result.filter(book => book.language === filters.value.language)
    }

    if (filters.value.publisherId) {
      result = result.filter(book => book.publisherId === filters.value.publisherId)
    }

    if (filters.value.categoryId) {
      result = result.filter(book => 
        book.categories && book.categories.some(cat => cat.categoryId === filters.value.categoryId)
      )
    }

    if (filters.value.yearFrom) {
      result = result.filter(book => book.publicationYear >= filters.value.yearFrom)
    }

    if (filters.value.yearTo) {
      result = result.filter(book => book.publicationYear <= filters.value.yearTo)
    }

    if (filters.value.availability) {
      if (filters.value.availability === 'available') {
        result = result.filter(book => book.availableCopies > 0)
      } else if (filters.value.availability === 'low') {
        result = result.filter(book => book.availableCopies > 0 && book.availableCopies < 5)
      } else if (filters.value.availability === 'out') {
        result = result.filter(book => book.availableCopies === 0)
      }
    }

    return result
  })

  const hasActiveFilters = computed(() => {
    return filters.value.language !== '' ||
      filters.value.publisherId !== '' ||
      filters.value.categoryId !== '' ||
      filters.value.yearFrom !== null ||
      filters.value.yearTo !== null ||
      filters.value.availability !== ''
  })

  const activeFilterCount = computed(() => {
    let count = 0
    if (filters.value.language) count++
    if (filters.value.publisherId) count++
    if (filters.value.categoryId) count++
    if (filters.value.yearFrom) count++
    if (filters.value.yearTo) count++
    if (filters.value.availability) count++
    return count
  })

  const resetFilters = () => {
    filters.value = {
      language: '',
      publisherId: '',
      categoryId: '',
      yearFrom: null,
      yearTo: null,
      availability: ''
    }
  }

  const visiblePages = computed(() => {
    const pages = []
    const maxVisible = 5
    let start = Math.max(0, currentPage.value - Math.floor(maxVisible / 2))
    let end = Math.min(totalPages.value, start + maxVisible)
    
    if (end - start < maxVisible) {
      start = Math.max(0, end - maxVisible)
    }
    
    for (let i = start; i < end; i++) {
      pages.push(i)
    }
    
    return pages
  })

  const loadBooks = async (page = 0) => {
    isLoading.value = true
    errorMessage.value = ''

    try {
      const params = {
        page: page,
        size: pageSize.value
      }
      
      const response = await booksAPI.getAll(params)
      
      console.log('📚 Books response:', response)
      
      // Parse response (Spring Boot Page format)
      if (response.content && Array.isArray(response.content)) {
        books.value = response.content
        currentPage.value = response.number || 0
        totalPages.value = response.totalPages || 1
        totalElements.value = response.totalElements || response.content.length
      } else if (response.data?.content) {
        books.value = response.data.content
        currentPage.value = response.data.number || 0
        totalPages.value = response.data.totalPages || 1
        totalElements.value = response.data.totalElements || response.data.content.length
      } else if (Array.isArray(response)) {
        books.value = response
        totalPages.value = 1
        totalElements.value = response.length
      } else if (response.data && Array.isArray(response.data)) {
        books.value = response.data
        totalPages.value = 1
        totalElements.value = response.data.length
      } else {
        books.value = []
      }
      
      // Load categories for each book
      await loadBookCategories()
      
      console.log('📚 Total books:', books.value.length)
    } catch (error) {
      console.error('Error loading books:', error)
      errorMessage.value = handleApiError(error, 'Không thể tải danh sách sách')
    } finally {
      isLoading.value = false
    }
  }

  const loadCategories = async () => {
    try {
      const response = await categoriesAPI.getAll()
      console.log('📚 Categories response:', response)
      
      // Handle different response formats
      if (Array.isArray(response)) {
        categories.value = response
      } else if (response.data && Array.isArray(response.data)) {
        categories.value = response.data
      } else if (response.content && Array.isArray(response.content)) {
        categories.value = response.content
      } else {
        categories.value = []
      }
      
      console.log('📚 Total categories loaded:', categories.value.length)
      console.log('📚 First category object:', categories.value[0])
      console.log('📚 All categories:', categories.value)
    } catch (error) {
      console.error('Error loading categories:', error)
      errorMessage.value = handleApiError(error, 'Không thể tải danh sách thể loại')
    }
  }

  const loadPublishers = async () => {
    try {
      const response = await publishersAPI.getAll()
      if (response.content && Array.isArray(response.content)) {
        publishers.value = response.content
      } else if (Array.isArray(response)) {
        publishers.value = response
      } else {
        publishers.value = []
      }
    } catch (error) {
      console.error('Error loading publishers:', error)
      errorMessage.value = handleApiError(error, 'Không thể tải danh sách nhà xuất bản')
    }
  }

  const loadBookCategories = async () => {
    try {
      const response = await bookCategoriesAPI.getAll()
      console.log('📚 Book categories response:', response)
      
      // Handle different response formats
      let allBookCategories = []
      if (Array.isArray(response)) {
        allBookCategories = response
      } else if (response.data && Array.isArray(response.data)) {
        allBookCategories = response.data
      } else if (response.content && Array.isArray(response.content)) {
        allBookCategories = response.content
      }
      
      // Map categories to books
      books.value.forEach(book => {
        book.categories = allBookCategories
          .filter(bc => bc.bookId === book.id && bc.category)
          .map(bc => bc.category)
          .filter(cat => cat && cat.categoryId)
      })
      
      console.log('📚 Mapped categories to books')
    } catch (error) {
      console.error('Error loading book categories:', error)
    }
  }

  const handleSearch = () => {
    // Local search - no need to call API
  }

  const goToPage = (page) => {
    if (page >= 0 && page < totalPages.value) {
      loadBooks(page)
    }
  }

  const editBook = (book) => {
    form.value = {
      title: book.title,
      publicationYear: book.publicationYear,
      language: book.language,
      edition: book.edition,
      quantity: book.quantity,
      publisherId: book.publisherId,
      selectedCategories: book.categories ? book.categories.map(c => c.id) : []
    }
    bookToDelete.value = book
    showEditModal.value = true
  }

  const confirmDelete = (book) => {
    bookToDelete.value = book
    showDeleteModal.value = true
  }

  const handleCreate = async (showToast) => {
    formError.value = ''
    isSubmitting.value = true

    try {
      // Validate required fields
      if (!form.value.title || form.value.title.trim() === '') {
        formError.value = 'Vui lòng nhập tên sách'
        isSubmitting.value = false
        return
      }

      if (!form.value.publicationYear || form.value.publicationYear < 1000 || form.value.publicationYear > new Date().getFullYear()) {
        formError.value = 'Năm xuất bản không hợp lệ'
        isSubmitting.value = false
        return
      }

      if (!form.value.quantity || form.value.quantity < 0) {
        formError.value = 'Số lượng phải lớn hơn hoặc bằng 0'
        isSubmitting.value = false
        return
      }

      if (!form.value.publisherId || form.value.publisherId === '' || form.value.publisherId === null) {
        formError.value = 'Vui lòng chọn nhà xuất bản'
        isSubmitting.value = false
        return
      }

      const createData = {
        title: form.value.title,
        publicationYear: parseInt(form.value.publicationYear),
        language: form.value.language,
        edition: form.value.edition,
        quantity: parseInt(form.value.quantity),
        publisherId: parseInt(form.value.publisherId)
      }
      
      const newBook = await booksAPI.create(createData)
      const bookId = newBook.id

      // Assign categories to the new book
      if (form.value.selectedCategories && form.value.selectedCategories.length > 0) {
        for (const categoryId of form.value.selectedCategories) {
          try {
            await bookCategoriesAPI.create({
              bookId: bookId,
              categoryId: categoryId
            })
          } catch (catError) {
            console.error(`Error assigning category ${categoryId}:`, catError)
          }
        }
      }
      
      showToast('Thêm sách thành công!', 'success')
      closeModals()
      loadBooks(currentPage.value)
    } catch (error) {
      console.error('Error creating book:', error)
      formError.value = handleApiError(error, 'Không thể thêm sách')
    } finally {
      isSubmitting.value = false
    }
  }

  const handleUpdate = async (showToast) => {
    formError.value = ''
    isSubmitting.value = true

    try {
      // Validate required fields
      if (!form.value.title || form.value.title.trim() === '') {
        formError.value = 'Vui lòng nhập tên sách'
        isSubmitting.value = false
        return
      }

      if (!form.value.publicationYear || form.value.publicationYear < 1000 || form.value.publicationYear > new Date().getFullYear()) {
        formError.value = 'Năm xuất bản không hợp lệ'
        isSubmitting.value = false
        return
      }

      const newQuantity = parseInt(form.value.quantity)
      if (isNaN(newQuantity) || newQuantity < 0) {
        formError.value = 'Số lượng phải lớn hơn hoặc bằng 0'
        isSubmitting.value = false
        return
      }

      // IMPORTANT: Validate quantity vs available copies
      // When reducing quantity, ensure it's not less than borrowed books
      const currentBook = bookToDelete.value
      if (currentBook && currentBook.availableCopies !== undefined) {
        const borrowedCopies = currentBook.quantity - currentBook.availableCopies
        if (newQuantity < borrowedCopies) {
          formError.value = `Không thể giảm số lượng xuống ${newQuantity}. Hiện có ${borrowedCopies} bản đang được mượn.`
          isSubmitting.value = false
          return
        }
      }

      const updateData = {
        title: form.value.title,
        publicationYear: parseInt(form.value.publicationYear),
        language: form.value.language,
        edition: form.value.edition,
        quantity: newQuantity,
        publisherId: form.value.publisherId
      }

      const bookId = bookToDelete.value.id
      
      await booksAPI.update(bookId, updateData)

      // Update categories - remove old ones, add new ones
      try {
        const allBookCategories = await bookCategoriesAPI.getAll()
        const existingCategories = allBookCategories.filter(bc => bc.bookId === bookId)
        const existingCategoryIds = existingCategories.map(bc => bc.categoryId)
        const selectedCategoryIds = form.value.selectedCategories || []

        // Remove categories that are no longer selected
        for (const existing of existingCategories) {
          if (!selectedCategoryIds.includes(existing.categoryId)) {
            console.log(`🗑️ Removing category ${existing.categoryId} from book ${bookId}`)
            await bookCategoriesAPI.delete(existing.id)
          }
        }

        // Add new categories
        for (const categoryId of selectedCategoryIds) {
          if (!existingCategoryIds.includes(categoryId)) {
            console.log(`➕ Adding category ${categoryId} to book ${bookId}`)
            await bookCategoriesAPI.create({
              bookId: bookId,
              categoryId: categoryId
            })
          }
        }
      } catch (catError) {
        console.error('❌ Error updating categories:', catError)
        showToast('Cập nhật sách thành công nhưng có lỗi khi cập nhật thể loại', 'warning')
      }
      
      showToast('Cập nhật thông tin thành công!', 'success')
      closeModals()
      loadBooks(currentPage.value)
    } catch (error) {
      console.error('Error updating book:', error)
      formError.value = handleApiError(error, 'Không thể cập nhật thông tin')
    } finally {
      isSubmitting.value = false
    }
  }

  const handleDelete = async (showToast) => {
    isDeleting.value = true

    try {
      const bookId = bookToDelete.value.id

      console.log('🗑️ Deleting book:', bookId)
      
      await booksAPI.delete(bookId)
      
      showToast('Xóa sách thành công!', 'success')
      showDeleteModal.value = false
      bookToDelete.value = null
      loadBooks(currentPage.value)
    } catch (error) {
      console.error('Error deleting book:', error)
      const errorMsg = handleApiError(error, 'Không thể xóa sách')
      showToast(errorMsg, 'error')
    } finally {
      isDeleting.value = false
    }
  }

  const closeModals = () => {
    showCreateModal.value = false
    showEditModal.value = false
    formError.value = ''
    // Reset form properties individually to maintain reactivity
    form.value.title = ''
    form.value.publicationYear = ''
    form.value.language = ''
    form.value.edition = ''
    form.value.quantity = 0
    form.value.publisherId = null
    form.value.selectedCategories = []
    bookToDelete.value = null
  }

  return {
    books,
    categories,
    publishers,
    searchQuery,
    isLoading,
    errorMessage,
    showFilters,
    filters,
    currentPage,
    pageSize,
    totalPages,
    totalElements,
    showCreateModal,
    showEditModal,
    showDeleteModal,
    form,
    formError,
    isSubmitting,
    bookToDelete,
    isDeleting,
    filteredBooks,
    hasActiveFilters,
    activeFilterCount,
    visiblePages,
    resetFilters,
    loadBooks,
    loadCategories,
    loadPublishers,
    loadBookCategories,
    handleSearch,
    goToPage,
    editBook,
    confirmDelete,
    handleCreate,
    handleUpdate,
    handleDelete,
    closeModals
  }
}
