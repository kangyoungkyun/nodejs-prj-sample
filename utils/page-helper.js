/**
 * 페이지 계산을 위한 유틸리티 함수
 * @param {number} totalItems    - 전체 항목 수
 * @param {number} currentPage   - 현재 페이지
 * @param {number} itemsPerPage  - 페이지당 항목 수
 * @param {number} pageLimit     - 페이지 단위 (한 번에 표시할 페이지 수)
 * @returns {object}             - 페이징 계산 결과 (현재 페이지, 총 페이지, 시작 페이지, 끝 페이지 등)
 */
function paginate(totalItems, currentPage = 1, itemsPerPage = 10, pageLimit = 5) {

    // 전체 페이지 개수
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // 현재 페이지가 범위를 벗어나지 않도록 조정
    currentPage = Math.max(1, Math.min(currentPage, totalPages));

    // 게시물의 시작 인덱스
    const startIndex = (currentPage - 1) * itemsPerPage;

    // 페이징 네비게이션 계산
    const startPage = Math.floor((currentPage - 1) / pageLimit) * pageLimit + 1;
    let endPage = startPage + pageLimit - 1;

    //끝 페이지가 총 페이지 수를 넘지 않도록 설정
    if (endPage > totalPages) {
        endPage = totalPages;
    }

    // 이전 및 다음 페이지
    const prevPage = startPage > 1 ? startPage - 1 : null;
    const nextPage = endPage < totalPages ? endPage + 1 : null;

    return {
        currentPage,
        totalPages,
        startIndex,
        startPage,
        endPage,
        prevPage,
        nextPage
    };
}

module.exports = { paginate };