import React from 'react';
import PropTypes from 'prop-types';

export interface Appointment {
  _id: string;
  slotStart: string;
  slotEnd: string;
  doctor: {
    name: string;
    clinic: string;
    specialties: string[];
  };
  patient?: {
    name: string;
    email: string;
    age: number;
    phone: string;
    reasonOfVisit: string;
  };
  description?: string;
}

interface AppointmentListProps {
  appointments: Appointment[];
  message?: string;
  setCancelState: (cancelState: { id: string; text: string }) => void;
}

const AppointmentList = ({ appointments = [], message = "", setCancelState }: AppointmentListProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleCancel = (appointmentId: string, doctorName: string) => {
    setCancelState({ 
      id: appointmentId, 
      text: 'I want to cancel this appointment of Dr. ' + doctorName  
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 font-sans">
      {message && (
        <div className="bg-blue-50 text-blue-800 px-4 py-3 rounded-md mb-6 font-medium">
          {message}
        </div>
      )}
      
      <div className="space-y-6">
        {appointments.map((appointment) => (
          <div 
            key={appointment._id} 
            className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                Appointment with Dr. {appointment.doctor.name}
              </h3>
              <span 
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  new Date(appointment.slotStart) > new Date() 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {new Date(appointment.slotStart) > new Date() ? 'Upcoming' : 'Completed'}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Doctor Information Column */}
              <div className="space-y-3 text-gray-700">
                <h4 className="font-medium text-gray-900 border-b pb-2">Appointment Details</h4>
                
                <div className="flex">
                  <span className="w-32 font-medium text-gray-600">Date & Time:</span>
                  <span>
                    {formatDate(appointment.slotStart)} - {formatTime(appointment.slotEnd)}
                  </span>
                </div>
                
                <div className="flex">
                  <span className="w-32 font-medium text-gray-600">Clinic:</span>
                  <span>{appointment.doctor.clinic}</span>
                </div>
                
                {appointment.doctor.specialties?.length > 0 && (
                  <div className="flex">
                    <span className="w-32 font-medium text-gray-600">Specialties:</span>
                    <span>{appointment.doctor.specialties.join(', ')}</span>
                  </div>
                )}
                
                {appointment.description && (
                  <div className="flex">
                    <span className="w-32 font-medium text-gray-600">Notes:</span>
                    <span>{appointment.description}</span>
                  </div>
                )}
              </div>

              {/* Patient Information Column */}
              {appointment.patient && (
                <div className="space-y-3 text-gray-700">
                  <h4 className="font-medium text-gray-900 border-b pb-2">Patient Information</h4>
                  
                  <div className="flex">
                    <span className="w-32 font-medium text-gray-600">Name:</span>
                    <span>{appointment.patient.name}</span>
                  </div>
                  
                  <div className="flex">
                    <span className="w-32 font-medium text-gray-600">Email:</span>
                    <span>{appointment.patient.email}</span>
                  </div>
                  
                  <div className="flex">
                    <span className="w-32 font-medium text-gray-600">Age:</span>
                    <span>{appointment.patient.age}</span>
                  </div>
                  
                  <div className="flex">
                    <span className="w-32 font-medium text-gray-600">Phone:</span>
                    <span>{appointment.patient.phone}</span>
                  </div>
                  
                  <div className="flex">
                    <span className="w-32 font-medium text-gray-600">Reason:</span>
                    <span>{appointment.patient.reasonOfVisit}</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-100">
              <button 
                onClick={() => handleCancel(appointment._id, appointment.doctor.name)} 
                className="px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition"
              >
                Cancel Appointment
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

AppointmentList.propTypes = {
  appointments: PropTypes.array.isRequired,
  message: PropTypes.string,
  setCancelState: PropTypes.func.isRequired
};

export default AppointmentList;