"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.I18n = void 0;
const checkFallback = (languages, fallback) => {
    if (fallback && !languages.includes(fallback)) {
        throw new Error(`The fallback language wasn't listed as a language.`);
    }
};
class I18n {
    constructor(options) {
        if (`folder` in options) {
            checkFallback(options.languages, options.fallback);
            this.fallback = options.fallback;
            this._languages = new Map(options.languages.map(language => [language, require(`${options.folder}/${language}`)]));
        }
        else {
            checkFallback(Object.keys(options.languages), options.fallback);
            this.fallback = options.fallback;
            this._languages = new Map(Object.entries(options.languages).map(([name, language]) => {
                if (typeof language !== `object`) {
                    throw new Error(`Invalid language map: ${typeof language}`);
                }
                return [name, language];
            }));
        }
    }
    get languages() {
        return [...this._languages.keys()];
    }
    _fallback(language, keyword, variables = {}) {
        if (this.fallback && language !== this.fallback) {
            return this.translate(this.fallback, keyword, variables);
        }
        return null;
    }
    translate(language, keyword, variables) {
        if (keyword === undefined || typeof keyword === `object` && keyword !== null) {
            if (!this.fallback) {
                throw new Error(`No language or fallback specified`);
            }
            return this.translate(this.fallback, language, keyword);
        }
        const _variables = variables !== null && variables !== void 0 ? variables : {};
        if (!this._languages.has(language)) {
            return this._fallback(language, keyword, _variables);
        }
        const lang = this._languages.get(language);
        const keys = keyword.split(`.`);
        let value = lang;
        for (const key of keys) {
            if (typeof value !== `object`) {
                break;
            }
            value = value[key];
        }
        if (!value || typeof value !== `string`) {
            return this._fallback(language, keyword, _variables);
        }
        return value.replace(/\{{2}(.+?)\}{2}/g, (_, variable) => { var _a; return ((_a = _variables[variable]) !== null && _a !== void 0 ? _a : variable).toString(); });
    }
    _update(oldValues, newValues) {
        const result = { ...oldValues };
        for (const key in newValues) {
            if (typeof newValues[key] === `object`) {
                // eslint-disable-next-line no-extra-parens
                const currentValue = typeof result[key] !== `object` ? {} : result[key];
                result[key] = this._update(currentValue, newValues[key]);
            }
            else {
                result[key] = newValues[key];
            }
        }
        return result;
    }
    update(language, newValues) {
        if (typeof language !== `string`) {
            throw new Error(`Invalid language type: ${typeof language}`);
        }
        else if (typeof newValues !== `object`) {
            throw new Error(`Invalid values type: ${typeof newValues}`);
        }
        const oldValues = this._languages.get(language);
        this._languages.set(language, this._update(oldValues || {}, newValues));
    }
}
exports.I18n = I18n;
exports.default = I18n;