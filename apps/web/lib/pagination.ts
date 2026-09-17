/**
 * High-performance sliding window pagination calculator (RFC-PAGIN-001).
 * Computes at most 7 to 9 page descriptors in O(1) time without allocating large arrays.
 */
export function getPaginationWindow(currentPage: number, totalPages: number): (number | '...')[] {
  if (totalPages <= 1) return [1];

  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, '...', totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
}
