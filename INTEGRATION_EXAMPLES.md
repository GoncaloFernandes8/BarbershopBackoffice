# Exemplos de Integração das Notificações

## Como integrar as notificações nos endpoints existentes

### 1. No ClientController - quando criar um novo cliente

```java
@RestController
@RequestMapping("/api/clients")
public class ClientController {
    
    @Autowired
    private ClientService clientService;
    
    @Autowired
    private NotificationService notificationService;
    
    @PostMapping
    public ResponseEntity<Client> createClient(@RequestBody Client client) {
        Client savedClient = clientService.save(client);
        
        // Criar notificação de novo cliente
        notificationService.notifyNewClient(savedClient.getName());
        
        return ResponseEntity.ok(savedClient);
    }
}
```

### 2. No AppointmentController - quando criar uma nova marcação

```java
@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {
    
    @Autowired
    private AppointmentService appointmentService;
    
    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private ClientService clientService;
    
    @Autowired
    private BarberService barberService;
    
    @PostMapping
    public ResponseEntity<Appointment> createAppointment(@RequestBody Appointment appointment) {
        Appointment savedAppointment = appointmentService.save(appointment);
        
        // Buscar dados do cliente e barbeiro
        Client client = clientService.findById(appointment.getClientId());
        Barber barber = barberService.findById(appointment.getBarberId());
        
        // Formatar horário
        String time = appointment.getStartsAt().format(DateTimeFormatter.ofPattern("HH:mm"));
        
        // Criar notificação de nova marcação
        notificationService.notifyNewAppointment(
            client.getName(), 
            barber.getName(), 
            time
        );
        
        return ResponseEntity.ok(savedAppointment);
    }
    
    @PutMapping("/{id}/cancel")
    public ResponseEntity<Appointment> cancelAppointment(@PathVariable Long id) {
        Appointment appointment = appointmentService.findById(id);
        appointment.setStatus("CANCELLED");
        Appointment savedAppointment = appointmentService.save(appointment);
        
        // Buscar dados do cliente
        Client client = clientService.findById(appointment.getClientId());
        String time = appointment.getStartsAt().format(DateTimeFormatter.ofPattern("HH:mm"));
        
        // Criar notificação de cancelamento
        notificationService.notifyAppointmentCancelled(client.getName(), time);
        
        return ResponseEntity.ok(savedAppointment);
    }
}
```

### 3. No ServiceController - quando criar/atualizar um serviço

```java
@RestController
@RequestMapping("/api/services")
public class ServiceController {
    
    @Autowired
    private ServiceService serviceService;
    
    @Autowired
    private NotificationService notificationService;
    
    @PostMapping
    public ResponseEntity<Service> createService(@RequestBody Service service) {
        Service savedService = serviceService.save(service);
        
        // Criar notificação de novo serviço
        notificationService.notifyNewService(savedService.getName());
        
        return ResponseEntity.ok(savedService);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Service> updateService(@PathVariable Long id, @RequestBody Service service) {
        Service savedService = serviceService.save(service);
        
        // Criar notificação de serviço atualizado
        notificationService.notifyServiceUpdated(savedService.getName());
        
        return ResponseEntity.ok(savedService);
    }
}
```

## Endpoints disponíveis

- `GET /api/notifications` - Listar todas as notificações
- `GET /api/notifications/unread` - Listar apenas não lidas
- `GET /api/notifications/unread/count` - Contar não lidas
- `PUT /api/notifications/{id}/read` - Marcar como lida
- `PUT /api/notifications/read-all` - Marcar todas como lidas
- `DELETE /api/notifications/{id}` - Deletar notificação
- `DELETE /api/notifications/cleanup` - Limpar notificações antigas

## Migração da base de dados

A migração `V2__Create_notifications_table.sql` será executada automaticamente pelo Flyway na próxima inicialização da aplicação.
