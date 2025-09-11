const path = require('path');
const common = require('../common');

module.exports = function(RED) {
    const utils = common(RED);
    
    function PathJoinNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        node.on('input', function(msg) {
            try {
                const parts = config.joinParts || [];
                const resolvedParts = parts.map(part => utils.getTypedInputValue(part.type, part.value, msg, node));
                const filteredParts = resolvedParts.filter(p => p != null && p !== '' && p !== 'undefined');
                
                if (filteredParts.length === 0) {
                    node.error("No valid path parts to join.", msg);
                    return;
                }
                
                let result = path.join(...filteredParts);

                // Always normalize first
                result = path.normalize(result);

                // Apply output options
                const outputAs = config.outputAs || 'absolute';
                if (outputAs === 'absolute') {
                    result = path.resolve(result);
                } else if (outputAs === 'relative') {
                    const relativeTo = utils.getTypedInputValue(config.relativeToType || 'str', config.relativeTo, msg, node);
                    if (typeof relativeTo !== 'string') {
                        node.error("Base directory for relative path is not a string.", msg);
                        return;
                    }
                    result = path.relative(relativeTo, result);
                }

                const outputProperty = config.outputProperty || 'payload';
                const outputPropertyType = config.outputPropertyType || 'msg';
                if (outputPropertyType === 'msg') {
                    RED.util.setMessageProperty(msg, outputProperty, result);
                } else if (outputPropertyType === 'flow') {
                    node.context().flow.set(outputProperty, result);
                } else if (outputPropertyType === 'global') {
                    node.context().global.set(outputProperty, result);
                }
                node.send(msg);

            } catch (err) {
                node.error(err.message, msg);
            }
        });
    }
    RED.nodes.registerType('path-join', PathJoinNode);
};
