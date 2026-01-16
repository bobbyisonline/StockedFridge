import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { H2, Body, Caption } from '@/components/ui/Typography';
import { TextField } from '@/components/ui/TextField';
import { Button } from '@/components/ui/Button';
import { COLORS, SPACING, BORDER_RADIUS } from '@/constants/theme';
import { FridgeItemInput } from '@/types/fridge.types';

interface AddIngredientModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (item: FridgeItemInput) => Promise<void>;
}

const CATEGORIES = [
  { value: 'protein', label: 'Protein' },
  { value: 'vegetable', label: 'Vegetable' },
  { value: 'grain', label: 'Grain' },
  { value: 'dairy', label: 'Dairy' },
  { value: 'spice', label: 'Spice' },
  { value: 'other', label: 'Other' },
] as const;

const COMMON_UNITS = ['g', 'kg', 'lb', 'oz', 'ml', 'L', 'cup', 'tbsp', 'tsp', 'piece', 'can', 'package'];

export function AddIngredientModal({ visible, onClose, onAdd }: AddIngredientModalProps) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [category, setCategory] = useState<FridgeItemInput['category']>('other');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReset = () => {
    setName('');
    setQuantity('');
    setUnit('');
    setCategory('other');
    setNotes('');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Required Field', 'Please enter an ingredient name');
      return;
    }

    setIsSubmitting(true);
    try {
      const item: FridgeItemInput = {
        name: name.trim(),
        category,
        quantity: quantity ? parseFloat(quantity) : undefined,
        unit: unit.trim() || undefined,
        notes: notes.trim() || undefined,
      };

      await onAdd(item);
      handleClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to add ingredient. Please try again.');
      console.error('Failed to add ingredient:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <H2>Add Ingredient</H2>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Body style={styles.closeButtonText}>✕</Body>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Name */}
            <View style={styles.field}>
              <Caption style={styles.label}>Ingredient Name *</Caption>
              <TextField
                placeholder="e.g., Chicken breast, Tomatoes"
                value={name}
                onChangeText={setName}
                autoFocus
              />
            </View>

            {/* Category */}
            <View style={styles.field}>
              <Caption style={styles.label}>Category</Caption>
              <View style={styles.categoryGrid}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.value}
                    style={[
                      styles.categoryButton,
                      category === cat.value && styles.categoryButtonActive,
                    ]}
                    onPress={() => setCategory(cat.value)}
                  >
                    <Body
                      style={
                        category === cat.value 
                          ? styles.categoryButtonTextActive 
                          : styles.categoryButtonText
                      }
                    >
                      {cat.label}
                    </Body>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Quantity & Unit */}
            <View style={styles.row}>
              <View style={[styles.field, styles.halfWidth]}>
                <Caption style={styles.label}>Quantity</Caption>
                <TextField
                  placeholder="0"
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={[styles.field, styles.halfWidth]}>
                <Caption style={styles.label}>Unit</Caption>
                <TextField
                  placeholder="e.g., cups, lbs"
                  value={unit}
                  onChangeText={setUnit}
                />
              </View>
            </View>

            {/* Common Units */}
            {!unit && (
              <View style={styles.field}>
                <Caption style={styles.label}>Quick Select</Caption>
                <View style={styles.unitGrid}>
                  {COMMON_UNITS.map((u) => (
                    <TouchableOpacity
                      key={u}
                      style={styles.unitChip}
                      onPress={() => setUnit(u)}
                    >
                      <Caption style={styles.unitChipText}>{u}</Caption>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Notes */}
            <View style={styles.field}>
              <Caption style={styles.label}>Notes (Optional)</Caption>
              <TextField
                placeholder="e.g., Organic, From farmers market"
                value={notes}
                onChangeText={setNotes}
                multiline
              />
            </View>
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              title="Cancel"
              onPress={handleClose}
              variant="secondary"
              size="medium"
              style={styles.actionButton}
            />
            <Button
              title="Add to Fridge"
              onPress={handleSubmit}
              variant="primary"
              size="medium"
              style={styles.actionButton}
              loading={isSubmitting}
              disabled={isSubmitting || !name.trim()}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  closeButtonText: {
    fontSize: 24,
    color: COLORS.textMuted,
  },
  content: {
    padding: SPACING.xl,
  },
  field: {
    marginBottom: SPACING.lg,
  },
  label: {
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  halfWidth: {
    flex: 1,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  categoryButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryButtonText: {
    fontSize: 14,
    color: COLORS.text,
  },
  categoryButtonTextActive: {
    color: COLORS.primaryTextOn,
    fontWeight: '600',
  },
  unitGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  unitChip: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  unitChipText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  actions: {
    flexDirection: 'row',
    padding: SPACING.xl,
    gap: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  actionButton: {
    flex: 1,
  },
});
