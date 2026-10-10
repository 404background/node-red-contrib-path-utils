/**
 * Common utilities for path-utils nodes
 */

module.exports = function(RED) {
    return {
        /**
         * Get value from typed input configuration.
         * Every Node-RED type (str, msg, flow, global, env, ...) is resolved by
         * RED.util.evaluateNodeProperty, so context stores (#:(file)::key) work.
         * @param {string} type - The input type (str, msg, flow, global, env, cwd)
         * @param {string} value - The input value
         * @param {object} msg - The message object
         * @param {object} node - The node instance for context access
         * @returns {string|undefined} The resolved value as string, or undefined if not found
         */
        getTypedInputValue: function(type, value, msg, node) {
            if (type === 'cwd') {
                return process.cwd();
            }
            let resolved;
            try {
                resolved = RED.util.evaluateNodeProperty(value, type, node, msg);
            } catch (err) {
                return undefined;
            }
            return resolved != null ? String(resolved) : undefined;
        },

        /**
         * Write the result to msg, flow or global (with an optional context store).
         * @param {string} type - msg, flow or global
         * @param {string} property - Property name, e.g. "payload" or "#:(file)::path"
         * @param {*} value - The value to write
         * @param {object} msg - The message object
         * @param {object} node - The node instance for context access
         */
        setOutputValue: function(type, property, value, msg, node) {
            if (type === 'flow' || type === 'global') {
                const target = RED.util.parseContextStore(property);
                node.context()[type].set(target.key, value, target.store);
            } else {
                RED.util.setMessageProperty(msg, property, value, true);
            }
        }
    };
};
