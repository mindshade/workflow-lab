const _pick = (...props) => o => props.reduce((a, e) => ({ ...a, [e]: typeof o[e] === 'object' ? JSON.stringify(o[e]) : o[e] }), {});

function from(objOrArray, ignoreProps, ...props) {
    if (ignoreProps != null && typeof ignoreProps !== "boolean") {
        props.unshift(ignoreProps);
        ignoreProps = false;
    }
    const pickFn = ignoreProps ? (e => e) :_pick(...props);
    if (Array.isArray(objOrArray)) {
        return objOrArray.map(r => pickFn(r));
    } else {
        return pickFn(objOrArray);
    }
}

module.exports = {
    from
};
