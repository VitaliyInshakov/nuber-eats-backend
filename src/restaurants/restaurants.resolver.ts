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
import { RestaurantsDto, RestaurantsOutput } from "./dto/restaurants.dto";
import { RestaurantDto, RestaurantOutput } from "./dto/restaurant.dto";
import { SearchRestaurantDto, SearchRestaurantOutput } from "./dto/search-restaurant.dto";
import { Dish } from "./entities/dish.entity";
import { CreateDishDto, CreateDishOutput } from "./dto/create-dish.dto";
import { EditDishDto, EditDishOutput } from "./dto/edit-dish.dto";
import { DeleteDishDto, DeleteDishOutput } from "./dto/delete-dish.dto";
import { MyRestaurantsDto } from "./dto/my-restaurants.dto";

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

    @Query(returns => MyRestaurantsDto)
    @Role(["Owner"])
    myRestaurants(@AuthUser() owner: User): Promise<MyRestaurantsDto> {
        return this.restaurantService.myRestaurants(owner);
    }

    @Query(returns => RestaurantsOutput)
    restaurants(@Args("input") restaurantsDto: RestaurantsDto): Promise<RestaurantsOutput> {
        return this.restaurantService.allRestaurants(restaurantsDto);
    }

    @Query(returns => RestaurantOutput)
    restaurant(@Args("input") restaurantDto: RestaurantDto): Promise<RestaurantOutput> {
        return this.restaurantService.findRestaurantById(restaurantDto);
    }

    @Query(returns => SearchRestaurantOutput)
    searchRestaurant(@Args("input") searchRestaurantDto: SearchRestaurantDto): Promise<SearchRestaurantOutput> {
        return this.restaurantService.searchRestaurantByName(searchRestaurantDto);
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
    category(@Args("input") categoryDto: CategoryDto): Promise<CategoryOutput> {
        return this.restaurantService.findCategoryBySlug(categoryDto);
    }
}

@Resolver(of => Dish)
export class DishResolver {
    constructor(private readonly restaurantService: RestaurantService) {}

    @Mutation(returns => CreateDishOutput)
    @Role(["Owner"])
    createDish(
        @AuthUser() authUser: User,
        @Args("input") createDishDto: CreateDishDto,
    ): Promise<CreateDishOutput> {
        return this.restaurantService.createDish(authUser, createDishDto);
    }

    @Mutation(returns => EditDishOutput)
    @Role(["Owner"])
    editDish(
        @AuthUser() authUser: User,
        @Args("input") editDishDto: EditDishDto,
    ): Promise<EditDishOutput> {
        return this.restaurantService.editDish(authUser, editDishDto);
    }

    @Mutation(returns => DeleteDishOutput)
    @Role(["Owner"])
    deleteDish(
        @AuthUser() authUser: User,
        @Args("input") deleteDishDto: DeleteDishDto,
    ): Promise<DeleteDishOutput> {
        return this.restaurantService.deleteDish(authUser, deleteDishDto);
    }
}