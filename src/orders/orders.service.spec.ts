import { Test } from "@nestjs/testing";
import { Repository } from "typeorm";
import { getRepositoryToken } from "@nestjs/typeorm";
import { PubSub } from "graphql-subscriptions";

import { Restaurant } from "src/restaurants/entities/restaurants.entity";
import { Dish } from "src/restaurants/entities/dish.entity";
import { PUB_SUB } from "src/common/common.constants";
import { OrdersService } from "./orders.service";
import { Order } from "./entities/order.entity";
import { OrderItem } from "./entities/order-item.entity";

const mockRepository = () => ({
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
});

const mockPubSub = () => ({
    publish: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>

describe("OrdersService", () => {
    let service: OrdersService;
    let ordersRepository: MockRepository<Order>;
    let orderItemsRepository: MockRepository<OrderItem>;
    let restaurantsRepository: MockRepository<Restaurant>;
    let dishesRepository: MockRepository<Dish>;
    let pubSub: PubSub;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                OrdersService,
                {
                    provide: getRepositoryToken(Order),
                    useValue: mockRepository(),
                },
                {
                    provide: getRepositoryToken(OrderItem),
                    useValue: mockRepository(),
                },
                {
                    provide: getRepositoryToken(Restaurant),
                    useValue: mockRepository(),
                },
                {
                    provide: getRepositoryToken(Dish),
                    useValue: mockRepository(),
                },
                {
                    provide: PUB_SUB,
                    useValue: mockPubSub(),
                },
            ],
        }).compile();

        service = module.get(OrdersService);
        ordersRepository = module.get(getRepositoryToken(Order));
        orderItemsRepository = module.get(getRepositoryToken(OrderItem));
        restaurantsRepository = module.get(getRepositoryToken(Restaurant));
        dishesRepository = module.get(getRepositoryToken(Dish));
        pubSub = module.get(PUB_SUB);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });
});