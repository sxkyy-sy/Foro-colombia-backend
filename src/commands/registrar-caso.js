const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('registrar-caso')
        .setDescription('Registra un caso en el canal de registro oficial.')
        .addStringOption(option => 
            option.setName('descripcion')
                .setDescription('Descripción breve del caso')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('acusado')
                .setDescription('Nombre del acusado')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('estado')
                .setDescription('Estado actual')
                .setRequired(true)
                .addChoices(
                    { name: 'Activo', value: 'Activo' },
                    { name: 'En Juicio', value: 'En Juicio' },
                    { name: 'Archivado', value: 'Archivado' },
                    { name: 'Cerrado', value: 'Cerrado' }
                ))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    
    async execute(interaction) {
        const descripcion = interaction.options.getString('descripcion');
        const acusado = interaction.options.getString('acusado');
        const estado = interaction.options.getString('estado');

        const guild = interaction.guild;
        const channelRegistro = guild.channels.cache.find(c => c.name === '📂-registro-de-casos-activos');

        if (!channelRegistro) {
            return interaction.reply({ content: '❌ No se encontró el canal de registro. Usa /setup-fiscalia primero.', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle(`📜 Registro de Caso Oficial`)
            .addFields(
                { name: 'Fiscal a Cargo', value: `<@${interaction.user.id}>`, inline: true },
                { name: 'Acusado', value: acusado, inline: true },
                { name: 'Estado', value: estado, inline: true },
                { name: 'Descripción', value: descripcion }
            )
            .setColor('#2980B9')
            .setTimestamp();

        await channelRegistro.send({ embeds: [embed] });
        await interaction.reply({ content: `✅ Caso registrado exitosamente en <#${channelRegistro.id}>`, ephemeral: true });
    },
};
