import { Args, Mutation, Resolver, Query, ResolveField, Int, Parent } from "@nestjs/graphql";

import { AuthUser } from "src/auth/auth-user.decorator";
import { User } from "src/users/entities/user.entity";
import { Role } from "src/auth/role.decorator";
import { RestaurantService } from "./restaurants.service";
import { Restaurant } from "./entities/restaurants.entity";
import { CreateRestaurantDto, CreateRestaurantOutput } from "./dto/create-restaurant.dto";
import { EditRestaurantDto, EditRestaurantOutput } from "./dto/edit-restaurant.dto";
import { DeleteRestaurantDto, DeleteRestaurantOutput } from "./dto/delete-restaurant.dto";
import { Category } from "./entities/category.entity";
import { AllCategoriesOutput } from "./dto/all-categories.dto";
import { CategoryDto, CategoryOutput } from "./dto/category.dto";

@Resolver(of => Restaurant)
export class RestaurantsResolver {
    constructor(private readonly restaurantService: RestaurantService) {}

    @Mutation(returns => CreateRestaurantOutput)
    @Role(["Owner"])
    async createRestaurant(
        @AuthUser() authUser: User,
        @Args("input") createRestaurantDto: CreateRestaurantDto
    ): Promise<CreateRestaurantOutput> {
      return await this.restaurantService.createRestaurant(authUser, createRestaurantDto);
    }

    @Mutation(returns => EditRestaurantOutput)
    @Role(["Owner"])
    async editRestaurant(
        @AuthUser() authUser: User,
        @Args("input") editRestaurantDto: EditRestaurantDto
    ): Promise<EditRestaurantOutput> {
        return await this.restaurantService.editRestaurant(authUser, editRestaurantDto);
    }

    @Mutation(returns => DeleteRestaurantOutput)
    @Role(["Owner"])
    async deleteRestaurant(
        @AuthUser() authUser: User,
        @Args("input") deleteRestaurantDto: DeleteRestaurantDto
    ): Promise<DeleteRestaurantOutput> {
        return await this.restaurantService.deleteRestaurant(authUser, deleteRestaurantDto);
    }
}

@Resolver(of => Category)
export class CategoryResolver {
    constructor(private readonly restaurantService: RestaurantService) {}

    @ResolveField(returns => Int)
    restaurantCount(@Parent() category: Category): Promise<number> {
        return this.restaurantService.countRestaurants(category);
    }

    @Query(returns => AllCategoriesOutput)
    allCategories(): Promise<AllCategoriesOutput> {
        return this.restaurantService.allCategories();
    }

    @Query(returns => CategoryOutput)
    category(@Args() categoryDto: CategoryDto): Promise<CategoryOutput> {
        return this.restaurantService.findCategoryBySlug(categoryDto);
    }
}