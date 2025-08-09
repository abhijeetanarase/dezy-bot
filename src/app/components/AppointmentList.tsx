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
      month: 'short',
      day: 'numeric',
      year: 'numeric',
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
      text: 'I want to cancel this appointment with Dr. ' + doctorName  
    });
  };

  return (
    <div className="max-w-4xl mx-auto  py-2 font-sans">
      {message && (
        <div className="bg-blue-50 px-4 py-3 rounded-md mb-6 text-sm sm:text-base text-blue-800">
          {message}
        </div>
      )}
      
      {appointments.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No appointments scheduled</p>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {appointments.map((appointment) => (
            <div 
              key={appointment._id} 
              className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                    Dr. {appointment.doctor.name}
                  </h3>
                  <span 
                    className={`px-2.5 py-0.5 rounded-full text-xs sm:text-sm font-medium ${
                      new Date(appointment.slotStart) > new Date() 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {new Date(appointment.slotStart) > new Date() ? 'Upcoming' : 'Completed'}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* Appointment Details */}
                  <div className="space-y-2 text-gray-700">
                    <div className="flex flex-col sm:flex-row gap-1 sm:gap-4">
                      <span className="w-28 sm:w-32 font-medium text-gray-600">Date:</span>
                      <span>{formatDate(appointment.slotStart)}</span>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-1 sm:gap-4">
                      <span className="w-28 sm:w-32 font-medium text-gray-600">Time:</span>
                      <span>
                        {formatTime(appointment.slotStart)} - {formatTime(appointment.slotEnd)}
                      </span>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-1 sm:gap-4">
                      <span className="w-28 sm:w-32 font-medium text-gray-600">Clinic:</span>
                      <span>{appointment.doctor.clinic}</span>
                    </div>
                  </div>
                  
                  {/* Doctor Details */}
                  <div className="space-y-2 text-gray-700">
                    {appointment.doctor.specialties?.length > 0 && (
                      <div className="flex flex-col sm:flex-row gap-1 sm:gap-4">
                        <span className="w-28 sm:w-32 font-medium text-gray-600">Specialties:</span>
                        <span className="flex flex-wrap gap-1">
                          {appointment.doctor.specialties.map((specialty, index) => (
                            <span key={index} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs">
                              {specialty}
                            </span>
                          ))}
                        </span>
                      </div>
                    )}
                    
                    {appointment.description && (
                      <div className="flex flex-col sm:flex-row gap-1 sm:gap-4">
                        <span className="w-28 sm:w-32 font-medium text-gray-600">Notes:</span>
                        <span className="italic">{appointment.description}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {new Date(appointment.slotStart) > new Date() && (
                <div className="px-4 sm:px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-end">
                  <button 
                    onClick={() => handleCancel(appointment._id, appointment.doctor.name)} 
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white text-red-600 rounded-md border border-red-200 hover:bg-red-50 transition text-sm sm:text-base"
                  >
                    Cancel Appointment
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

AppointmentList.propTypes = {
  appointments: PropTypes.array.isRequired,
  message: PropTypes.string,
  setCancelState: PropTypes.func.isRequired
};

export default AppointmentList;