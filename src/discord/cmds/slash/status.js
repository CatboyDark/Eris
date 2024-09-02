const { readConfig, getEmoji } = require('../../../helper/utils.js');

module.exports =
{
    name: 'status',
    desc: 'Displays bot features status',
    permissions: ['ManageGuild'],

    async execute(interaction) {
        const config = readConfig();

        // Fetch emojis
        const greenCircle = await getEmoji('status_green');
        const redCircle = await getEmoji('status_red');

        // Define the configuration keys to track and include newline markers
        const configKeys =
		[
		    { 'logs.enabled': '**Logging**' },
		    { 'logs.auditLog': 'Audit Log' },
		    'newline', // Marker for a newline
		    { 'features.bridgeToggle': 'Bridge' }
		];

        // Helper function to retrieve and format status messages
        const buildStatusMessage = (configKeys, config) => {
            return configKeys.map(item => {
                if (item === 'newline') return '\n';
                const [key, label] = Object.entries(item)[0];
                const value = key.split('.').reduce((o, i) => o?.[i], config);
                const emoji = value ? greenCircle : redCircle;
                return `${emoji} ${label}\n`;
            }).join('');
        };

        // Build and send the status message
        const statusMessage = `**Features:**\n\n${buildStatusMessage(configKeys, config)}`;
        await interaction.reply(statusMessage);
    }
};
