import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';

const STATUS_COLORS = {
  confirmado: '#22c55e',
  pendente: '#f59e0b',
  cancelado: '#ef4444',
};

function toEvents(appointments) {
  return appointments.map((a) => ({
    id: String(a.id),
    title: a.patients?.nome ?? 'Paciente',
    start: `${a.data}T${a.hora}`,
    backgroundColor: STATUS_COLORS[a.status] ?? '#6b7280',
    borderColor: STATUS_COLORS[a.status] ?? '#6b7280',
    extendedProps: { status: a.status },
  }));
}

export default function AgendaCalendar({ appointments = [], onEventClick, onEventDrop }) {
  return (
    <div style={{ background: '#fff', borderRadius: 8, padding: 16 }}>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        locale={ptBrLocale}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        slotMinTime="07:00:00"
        slotMaxTime="21:00:00"
        allDaySlot={false}
        editable={true}
        selectable={true}
        height="auto"
        events={toEvents(appointments)}
        eventClick={(info) => onEventClick?.(info.event.id)}
        eventDrop={(info) => {
          const novaData = info.event.startStr.slice(0, 10);
          const novaHora = info.event.startStr.slice(11, 16);
          onEventDrop?.(info.event.id, novaData, novaHora, info.revert);
        }}
      />
    </div>
  );
}
