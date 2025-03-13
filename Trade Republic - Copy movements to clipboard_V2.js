function copyTimelineToClipboard() {
    const events = document.querySelectorAll('.timelineV2Event');
    console.log('Eventos encontrados:', events.length);
    if (events.length === 0) {
        alert('No se encontraron elementos con clase "timelineV2Event"');
        return;
    }

    let tableData = [];
    const now = new Date(); // Fecha actual: 9 de marzo de 2025
    const currentYear = now.getFullYear(); // 2025
    const currentMonth = now.getMonth() + 1; // Marzo = 3

    let previousMonthProcessed = currentMonth; // Mes de referencia inicial
    let year = currentYear; // Año inicial

    events.forEach((event, index) => {
        // Obtener el texto completo del subtitle
        const subtitleText = event.querySelector('.timelineV2Event__subtitle')?.textContent.trim() || '';
        const subtitleParts = subtitleText.split(' - '); // Separa por " - "
        const dateOriginal = subtitleParts[0] || ''; // Formato DÍA/MES, ej: "3/9"

        // Reformatear la fecha a DÍA/MES/AÑO
        let dateFormatted = '';
        if (dateOriginal.includes('/')) { // Verificar que haya una barra
            const [day, month] = dateOriginal.split('/').map(Number); // Divide DÍA/MES y convierte a números

            // Ajustar el año si hay un salto hacia atrás en los meses
            if (index === 0) {
                // Para la primera fecha (la más reciente), comparamos con el mes actual
                if (month > currentMonth) {
                    year = currentYear - 1; // Si el mes es mayor, es del año anterior
                }
            } else if (month > previousMonthProcessed) {
                // Si el mes sube respecto al anterior procesado, reducimos el año
                year--;
            }
            previousMonthProcessed = month; // Actualizamos el mes de referencia

            dateFormatted = `${day}/${month}/${year}`; // Ej: "9/3/2025"
        } else {
            console.warn(`Fila ${index + 1}: Fecha inválida o ausente - ${dateOriginal}`);
        }

        // Obtener el concept original
        let concept = event.querySelector('.timelineV2Event__title')?.textContent.trim() || '';
        if (subtitleParts.length > 1) {
            const extraParts = subtitleParts.slice(1).join(' ');
            concept = `${concept} - ${extraParts}`.trim();
        }

        // Obtener y procesar el precio
        const priceDiv = event.querySelector('.timelineV2Event__price');
        const priceText = priceDiv?.querySelector('p')?.textContent.trim() || '';
        const amountMatch = priceText.match(/[0-9]+(?:\,[0-9]+)?/);
        let amount = amountMatch ? amountMatch[0] : '';
        if (priceText.startsWith('+')) {
            amount = `+${amount}`;
        } else {
            amount = `-${amount}`;
        }

        console.log(`Fila ${index + 1}:`, { date: dateFormatted, concept, amount });
        const row = `${dateFormatted}\t${concept}\t${amount}`;
        tableData.push({ date: dateFormatted, row }); // Guardamos la fila con la fecha
    });

    // Obtener la opción seleccionada del <select>
    const select = document.getElementById('listaMovimientos');
    const selectedOption = select.value; // "mes-anterior" o "todos"

    let filteredTableData;
    if (selectedOption === 'mes-anterior') {
        // Filtrar por el mes anterior
        const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1); // Febrero 2025
        const previousMonthNum = previousMonth.getMonth() + 1; // Febrero = 2
        const previousYear = previousMonth.getFullYear(); // 2025

        filteredTableData = tableData.filter(item => {
            if (!item.date || !item.date.includes('/')) {
                console.warn('Fecha inválida en filtrado:', item);
                return false; // Excluir filas sin fecha válida
            }
            const [day, month, year] = item.date.split('/').map(Number);
            return month === previousMonthNum && year === previousYear;
        }).map(item => item.row);

        if (filteredTableData.length === 0) {
            alert('No hay eventos del mes anterior para copiar.');
            return;
        }
    } else {
        // Si es "todos", no filtrar, usar todas las filas
        filteredTableData = tableData.map(item => item.row);
    }
	
	// Reemplazar "-" por "+0" en filteredTableData
    filteredTableData = filteredTableData.map(row => {
        const parts = row.split('\t'); // Divide en [fecha, concepto, amount]
        if (parts[2] === '-') { // Si amount es "-"
            parts[2] = '+0'; // Reemplazar por "+0"
        }
        return parts.join('\t'); // Reconstruir la fila
    });

    const tableText = filteredTableData.join('\n');
    console.log('Texto a copiar:', tableText);
    navigator.clipboard.writeText(tableText)
        .then(() => alert('Datos copiados al portapapeles'))
        .catch(err => alert('Error al copiar: ' + err));
}		const now = new Date(); // Fecha actual
		const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1); // Mes anterior
		const previousMonthNum = previousMonth.getMonth() + 1; // getMonth() es 0-based, sumamos 1
		const previousYear = previousMonth.getFullYear();

// Crea un botón temporal para ejecutar la función copyTimelineToClipboard
const button = document.querySelector('.buttonBase.cashManagement__payout.buttonPrimary.cashManagement__payout');
if (button) {
    const htmlToInsert = `
		<button id="miButton" class="buttonBase buttonPrimary" type="button" aria-live="polite" style="background-color: #1EA362; color: white; padding: 10px;">
			<span class="buttonBase__titleWrapper">
				<!---->
					<span class="buttonBase__title" style="white-space: normal; height: auto; display: inline-block; min-width: 100px; max-width: none; overflow: visible; word-wrap: break-word;">Copiar movimientos al portapapeles</span>
				<!---->
			</span>
		</button>
		<select name="movimientos" id="listaMovimientos" class="buttonBase buttonPrimary" type="button" aria-live="polite" style="background-color: #1EA362; color: white; padding: 10px;">
			<option value="mes-anterior" selected>Movimientos del mes anterior</option>
			<option value="todos">Todos los movimientos</option>
		</select>
    `;
    button.insertAdjacentHTML('afterend', htmlToInsert);
	
	const miButton = document.getElementById('miButton');
    miButton.addEventListener('click', copyTimelineToClipboard);
}