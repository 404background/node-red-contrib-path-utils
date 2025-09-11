/**
 * Common utilities for path-utils nodes
 */

module.exports = function(RED) {
    return {
        /**
         * Get value from typed input configuration
         * @param {string} type - The input type (str, msg, flow, global, cwd)
         * @param {string} value - The input value
         * @param {object} msg - The message object
         * @param {object} node - The node instance for context access
         * @returns {string|undefined} The resolved value as string, or undefined if not found
         */
        getTypedInputValue: function(type, value, msg, node) {
            switch (type) {
                case 'str':
                    return String(value);
                case 'msg':
                    const msgValue = RED.util.getMessageProperty(msg, value);
                    return msgValue != null ? String(msgValue) : undefined;
                case 'flow':
                    const flowValue = node.context().flow.get(value);
                    return flowValue != null ? String(flowValue) : undefined;
                case 'global':
                    const globalValue = node.context().global.get(value);
                    return globalValue != null ? String(globalValue) : undefined;
                case 'cwd':
                    return process.cwd();
                default:
                    return undefined;
            }
        }
    };
};
