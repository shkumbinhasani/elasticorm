import { ESField } from './base.ts';
import type { TextFieldOptions } from '../types.ts';

export class ESTextField<
  Required extends boolean = false,
  HasDefault extends boolean = false,
  IsArray extends boolean = false,
> extends ESField<string, 'text', Required, HasDefault, IsArray> {
  protected _textOptions: TextFieldOptions;

  constructor(options: TextFieldOptions = {}) {
    super('text', options);
    this._textOptions = options;
  }

  protected _clone(): ESTextField<Required, HasDefault, IsArray> {
    const clone = new ESTextField<Required, HasDefault, IsArray>(this._textOptions);
    clone.$fieldName = this.$fieldName;
    clone.$required = this.$required;
    clone.$hasDefault = this.$hasDefault;
    clone._defaultValue = this._defaultValue;
    clone.$isArray = this.$isArray;
    clone._options = { ...this._options };
    clone._parent = this._parent;
    return clone;
  }

  override notNull(): ESTextField<true, HasDefault, IsArray> {
    return super.notNull() as ESTextField<true, HasDefault, IsArray>;
  }

  override default(value: string): ESTextField<Required, true, IsArray> {
    return super.default(value) as ESTextField<Required, true, IsArray>;
  }

  override array(): ESTextField<Required, HasDefault, true> {
    return super.array() as ESTextField<Required, HasDefault, true>;
  }

  _toMapping(): Record<string, unknown> {
    const mapping: Record<string, unknown> = {
      type: 'text',
    };

    if (this._textOptions.analyzer) mapping.analyzer = this._textOptions.analyzer;
    if (this._textOptions.search_analyzer) mapping.search_analyzer = this._textOptions.search_analyzer;
    if (this._textOptions.search_quote_analyzer) mapping.search_quote_analyzer = this._textOptions.search_quote_analyzer;
    if (this._textOptions.index_options) mapping.index_options = this._textOptions.index_options;
    if (this._textOptions.norms !== undefined) mapping.norms = this._textOptions.norms;
    if (this._textOptions.term_vector) mapping.term_vector = this._textOptions.term_vector;
    if (this._textOptions.fielddata !== undefined) mapping.fielddata = this._textOptions.fielddata;
    if (this._textOptions.eager_global_ordinals !== undefined) mapping.eager_global_ordinals = this._textOptions.eager_global_ordinals;
    if (this._textOptions.index_phrases !== undefined) mapping.index_phrases = this._textOptions.index_phrases;
    if (this._textOptions.index_prefixes) mapping.index_prefixes = this._textOptions.index_prefixes;
    if (this._textOptions.similarity) mapping.similarity = this._textOptions.similarity;
    if (this._options.index !== undefined) mapping.index = this._options.index;
    if (this._options.store !== undefined) mapping.store = this._options.store;
    if (this._options.copy_to) mapping.copy_to = this._options.copy_to;
    if (this._options.meta) mapping.meta = this._options.meta;

    return mapping;
  }
}

export function esText(options: TextFieldOptions = {}): ESTextField {
  return new ESTextField(options);
}
