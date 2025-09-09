
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../common/product';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { CartItem } from '../../common/cart-item';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, NgbPaginationModule, FormsModule],
  templateUrl: './product-list-grid.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  // Danh sách sản phẩm hiển thị ở UI
  products: Product[] = [];

  // ID danh mục hiện tại (mặc định 1) và ID danh mục trước đó để phát hiện thay đổi
  currentCategoryId: number = 1;
  previousCategoryId: number = 1;

  // Cờ xác định đang ở chế độ tìm kiếm (có param 'keyword' trên URL) hay duyệt theo danh mục
  searchMode: boolean = false;

  // Trạng thái phân trang
  thePageNumber: number = 1;     // Trang hiện tại (UI dùng 1-based)
  thePageSize: number = 5;       // Số phần tử trên mỗi trang
  theTotalElements: number = 0;  // Tổng số phần tử (để tính tổng số trang)

  // Ghi nhớ keyword lần trước để khi keyword đổi thì reset về trang 1
  previousKeyword?: string;

  // DI: Inject ProductService để gọi API; ActivatedRoute để đọc tham số route (id, keyword)
  constructor(
    private readonly productService: ProductService,
    private readonly router: ActivatedRoute,
    private readonly cartService: CartService
  ) { }

  /**
   * Lifecycle hook chạy 1 lần sau khi component khởi tạo.
   * Ở đây ta subscribe vào paramMap để mỗi khi tham số route thay đổi
   * (vd: chuyển danh mục khác, hoặc nhập keyword khác) thì gọi listProducts().
   */
  ngOnInit(): void {
    this.router.paramMap.subscribe(() => {
      this.listProducts();
    });
  }

  /**
   * Điều hướng luồng xử lý:
   * - Nếu URL có param 'keyword' => chế độ tìm kiếm
   * - Ngược lại => liệt kê theo danh mục.
   */
  listProducts() {
    this.searchMode = this.router.snapshot.paramMap.has('keyword');
    if (this.searchMode) {
      this.handleSearchProducts();
    } else {
      this.handleListProduct();
    }
  }

  /**
   * Lấy danh sách sản phẩm theo danh mục (có phân trang).
   * - Đọc 'id' từ route để biết danh mục hiện tại.
   * - Nếu danh mục thay đổi so với lần trước => reset về trang 1.
   * - Gọi service getProductListPaginate(pageIndex, pageSize, categoryId).
   *   Lưu ý pageIndex ở backend thường 0-based nên trừ đi 1.
   */
  handleListProduct() {
    const hasCategoryId: boolean = this.router.snapshot.paramMap.has('id');

    if (hasCategoryId) {
      // Sử dụng Number(...) để chuyển chuỗi -> số
      this.currentCategoryId = Number(this.router.snapshot.paramMap.get('id'));
    } else {
      // Không có id trên URL thì về mặc định danh mục 1
      this.currentCategoryId = 1;
    }

    // Nếu chuyển sang danh mục khác thì reset về trang đầu
    if (this.previousCategoryId != this.currentCategoryId) {
      this.thePageNumber = 1;
    }

    // Cập nhật lại danh mục trước đó
    this.previousCategoryId = this.currentCategoryId;

    // Gọi API lấy dữ liệu phân trang theo danh mục
    this.productService.getProductListPaginate(
      this.thePageNumber - 1,   // backend 0-based
      this.thePageSize,
      this.currentCategoryId
    ).subscribe(this.processResult()); // Xử lý response theo cùng 1 hàm
  }

  /**
   * Xử lý tìm kiếm theo từ khóa (có phân trang).
   * - Đọc 'keyword' từ route.
   * - Nếu keyword thay đổi so với lần trước => reset về trang 1.
   * - Gọi service searchProductsPaginate(pageIndex, pageSize, keyword).
   */
  handleSearchProducts() {
    const theKeyword: string = this.router.snapshot.paramMap.get('keyword')!;

    // Khi keyword thay đổi thì reset trang về 1 để tránh lệch dữ liệu
    if (this.previousKeyword != theKeyword) {
      this.thePageNumber = 1;
    }

    // Lưu lại keyword hiện tại
    this.previousKeyword = theKeyword;

    // Gọi API tìm kiếm có phân trang
    this.productService.searchProductsPaginate(
      this.thePageNumber - 1,  // backend 0-based
      this.thePageSize,
      theKeyword
    ).subscribe(this.processResult());
  }

  /**
   * Trả về một hàm (closure) để dùng trong subscribe().
   * Hàm này nhận response từ backend và map về state của component.
   *
   * Kỳ vọng response dạng HATEOAS (Spring Data REST):
   * {
   *   _embedded: { products: Product[] },
   *   page: { number: 0-based, size: number, totalElements: number }
   * }
   */
  processResult() {
    return (data: {
      _embedded: { products: Product[]; };
      page: { number: number; size: number; totalElements: number; };
    }) => {
      // Cập nhật danh sách sản phẩm
      this.products = data._embedded.products;

      // Đồng bộ thông tin phân trang (UI dùng 1-based)
      this.thePageNumber = data.page.number + 1;
      this.thePageSize = data.page.size;
      this.theTotalElements = data.page.totalElements;
    };
  }

  /**
   * Khi người dùng chọn kích thước trang mới (page size),
   * ta reset về trang 1 và tải lại danh sách cho đúng dữ liệu.
   */
  updatePageSize(pageSize: number) {
    this.thePageSize = pageSize;
    this.thePageNumber = 1;
    this.listProducts();
  }

  addToCart(theProduct: Product) {

    console.log(`Adding to cart: ${theProduct.name}, ${theProduct.unitPrice}`);
    const theCartItem = new CartItem(theProduct);
    this.cartService.addToCart(theCartItem);
  }

}



