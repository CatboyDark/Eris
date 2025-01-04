import { createCommandDataMsg, dataButtons } from '../../logic/data.js';

export default 
{
    name: 'data',
    desc: 'Display bot usage data',
	
    async execute(interaction) {
        const dataMsg = await createCommandDataMsg();
        await interaction.reply({
            embeds: [dataMsg],
            components: [dataButtons]
        });
    }
};
