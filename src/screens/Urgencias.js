import React from 'react';
import { MdOutlineCloudDownload } from 'react-icons/md';
import { toast } from 'react-hot-toast';
import { BiChevronDown, BiPlus } from 'react-icons/bi';
import Layout from '../Layout';
import { Button, Select } from '../components/Form';
import { MedicineTable } from '../components/Tables';
import { medicineData, sortsDatas } from '../components/Datas';
import AddEditMedicineModal from '../components/Modals/AddEditMedicine';

function Urgencias() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [data, setData] = React.useState({});
  const [status, setStatus] = React.useState(sortsDatas.stocks[0]);

  const onCloseModal = () => {
    setIsOpen(false);
    setData({});
  };

  const onEdit = (datas) => {
    setIsOpen(true);
    setData(datas);
  };

  return (
    <Layout>
      <div
        data-aos="fade-right"
        data-aos-duration="1000"
        data-aos-delay="100"
        data-aos-offset="200"
      >
      {isOpen && (
        <AddEditMedicineModal
          datas={data}
          isOpen={isOpen}
          closeModal={onCloseModal}
        />
      )}
      {/* add button */}
      <button
        onClick={() => setIsOpen(true)}
      >
        <BiPlus className="text-2xl" />
      </button>
      {/*  */}
      <h1 className="text-xl font-semibold">Urgencias</h1>
    
      </div>
    </Layout>
  );
}

export default Urgencias;
