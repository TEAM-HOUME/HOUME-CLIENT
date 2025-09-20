import { useState } from 'react';

import { useHousingOptionsQuery } from '@/pages/imageSetup/apis/houseInfo';

import ButtonGroup, { type ButtonOption } from './buttonGroup/ButtonGroup';

const Test = () => {
  const { data: housingOptions, isLoading } = useHousingOptionsQuery();

  const [selectedHouseTypes, setSelectedHouseTypes] = useState<string[]>([]);
  const [selectedRoomTypes, setSelectedRoomTypes] = useState<string[]>([]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // API 데이터를 ButtonOption 형태로 변환
  const houseTypeOptions: ButtonOption[] =
    housingOptions?.houseTypes.map((option) => ({
      code: option.code,
      label: option.label,
    })) || [];

  const roomTypeOptions: ButtonOption[] =
    housingOptions?.roomTypes.map((option) => ({
      code: option.code,
      label: option.label,
    })) || [];

  return (
    <div
      style={{
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
      }}
    >
      <h1>ButtonGroup 테스트</h1>

      {/* 주거 형태 - Single Selection */}
      <ButtonGroup
        title="주거 형태"
        titleSize="large"
        options={houseTypeOptions}
        selectedCodes={selectedHouseTypes}
        onSelectionChange={setSelectedHouseTypes}
        selectionMode="single"
        buttonSize="medium"
        layout="grid-2"
        hasBorder={true}
      />

      {/* 구조 - Multiple Selection */}
      <ButtonGroup
        title="구조"
        titleSize="small"
        options={roomTypeOptions}
        selectedCodes={selectedRoomTypes}
        onSelectionChange={setSelectedRoomTypes}
        selectionMode="multiple"
        maxSelection={2}
        buttonSize="small"
        layout="grid-3"
        hasBorder={false}
      />

      {/* 선택된 값 표시 */}
      <div
        style={{
          marginTop: '2rem',
          padding: '1rem',
          backgroundColor: '#f5f5f5',
        }}
      >
        <h3>선택된 값:</h3>
        <p>주거 형태: {selectedHouseTypes.join(', ')}</p>
        <p>구조: {selectedRoomTypes.join(', ')}</p>
      </div>
    </div>
  );
};

export default Test;
