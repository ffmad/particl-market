// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { inject, named } from 'inversify';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { BaseCommand } from '../BaseCommand';
import { Commands } from '../CommandEnumType';
import { ShoppingCartItemService } from '../../services/model/ShoppingCartItemService';
import { ListingItemService } from '../../services/model/ListingItemService';
import { MessageException } from '../../exceptions/MessageException';

export class ShoppingCartItemRemoveCommand extends BaseCommand implements RpcCommandInterface<void> {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.model.ShoppingCartItemService) private shoppingCartItemService: ShoppingCartItemService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemService) private listingItemService: ListingItemService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(Commands.SHOPPINGCARTITEM_REMOVE);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: cartId
     *  [1]: itemId | hash
     *
     * @param data
     * @returns {Promise<void>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<void> {
        if (data.params[0] && data.params[1]) {
            // check if listingItem hash then get Id and pass as parameter
            let listingItemId = data.params[1];
            if (typeof data.params[1] !== 'number') {
                const listingItem = await this.listingItemService.findOneByHash(listingItemId);
                listingItemId = listingItem.id;
            }
            const isItemExistOnCart = await this.shoppingCartItemService.findOneByCartIdAndListingItemId(data.params[0], listingItemId);
            if (isItemExistOnCart === null) {
                this.log.warn(`listing item not exist on shopping cart`);
                throw new MessageException(`listing item not exist on shopping cart`);
            } else {
                // delete
                return this.shoppingCartItemService.destroy(isItemExistOnCart.Id);
            }
        } else {
            throw new MessageException('cartId and listingItemId can\'t be blank');
        }
    }

    public async validate(data: RpcRequest): Promise<RpcRequest> {
        return data;
    }

    public usage(): string {
        return this.getName() + ' <cartId> <listingItemId> ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <cartId>                 - The id of the ShoppingCart. \n'
            + '    <listingItemId>          - The id of the ListingItem we want to add to the ShoppingCart. \n';
    }

    public description(): string {
        return 'Remove ShoppingCartItem from ShoppingCart.';
    }

    public example(): string {
        return 'cartitem ' + this.getName() + ' 1 1 b90cee25-036b-4dca-8b17-0187ff325dbb ';
    }
}
