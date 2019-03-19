const _pick = (...props) => o => props.reduce((a, e) => ({ ...a, [e]: o[e] }), {});

function from(objOrArray, ...props) {
    const pickFn = _pick(...props);
    if (Array.isArray(objOrArray)) {
        return objOrArray.map(r => pickFn(r));
    } else {
        return pickFn(objOrArray);
    }
}

module.exports = {
    from
};
