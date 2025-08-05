package com.tobezero01.eshopmini.config;

import com.tobezero01.eshopmini.entity.Product;
import com.tobezero01.eshopmini.entity.ProductCategory;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.rest.core.config.RepositoryRestConfiguration;
import org.springframework.data.rest.webmvc.config.RepositoryRestConfigurer;
import org.springframework.http.HttpMethod;
import org.springframework.web.servlet.config.annotation.CorsRegistry;

@Configuration
public class MyDataRestConfig implements RepositoryRestConfigurer {

    @Override
    public void configureRepositoryRestConfiguration(RepositoryRestConfiguration config, CorsRegistry cors) {
        HttpMethod[] unsupported = { HttpMethod.PUT, HttpMethod.POST, HttpMethod.DELETE };

        config.getExposureConfiguration()
                .forDomainType(Product.class)
                .withItemExposure((metadata, methods) -> methods.disable(unsupported))
                .withCollectionExposure((metadata, methods) -> methods.disable(unsupported));

        config.getExposureConfiguration()
                .forDomainType(ProductCategory.class)
                .withItemExposure((metadata, methods) -> methods.disable(unsupported))
                .withCollectionExposure((metadata, methods) -> methods.disable(unsupported));
    }
}
