import { SetMetadata } from '@nestjs/common';

export const ROUTE_FEATURE_NAME = Symbol('ROUTE_FEATURE_NAME');

export const RouteFeatureName = (name: string) => SetMetadata(ROUTE_FEATURE_NAME, name);
