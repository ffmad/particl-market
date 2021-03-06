// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { NotificationType } from '../enums/NotificationType';

export class MarketplaceNotification {
    public event: NotificationType;
    public payload: object;
}
