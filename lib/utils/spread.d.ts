import { Entity } from '../glossary';
/**
 * Clones the given object, preserving its setters/getters.
 */
export declare function spread<ObjectType extends Record<string | number | symbol, unknown> | Entity<any, any>>(source: ObjectType): ObjectType;
