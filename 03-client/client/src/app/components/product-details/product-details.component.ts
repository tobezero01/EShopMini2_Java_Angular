import { Component, OnInit } from '@angular/core';
import { Product } from '../../common/product';
import { ProductService } from '../../services/product.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css'
})
export class ProductDetailsComponent implements OnInit {

  product?: Product;

  constructor(
    private readonly productService: ProductService,
    private readonly route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(() => this.handleProductDetail());
  }

  private handleProductDetail() {
    const theProductId = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isFinite(theProductId)) return; // guard nhẹ
    this.productService.getProduct(theProductId).subscribe(data => this.product = data);
  }
}
