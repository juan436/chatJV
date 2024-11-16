'use client'
import React from 'react';
import { useForm } from 'react-hook-form';

import { FormSignup } from '@/components/form';
import useSubmit from '@/hooks/user/useSubmit';

function SignupPage() {
    const reactHookForm = useForm();
    const { onSubmit } = useSubmit(reactHookForm.reset);

    return (
        <FormSignup reactHookForm={reactHookForm} onSubmit={onSubmit} />
    );
}

export default SignupPage;